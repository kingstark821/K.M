// index.js — point d'entrée de KING-MD : charge les commandes, démarre le serveur
// HTTP (sert index.html + /code pour le pairing), branche lib/whatsapp.js
// (connexion) et lib/messageHandler.js (traitement des messages).

const fs = require('fs');
const path = require('path');
const Module = require('module');
const express = require('express');

const { installErrorGuard } = require('./lib/errorGuard');
const { startCleanupLoop } = require('./lib/cleanup');
const { startMessageStoreCleanup } = require('./lib/messageStore');
const { startWhatsApp } = require('./lib/whatsapp');
const { createMessageHandler } = require('./lib/messageHandler');

// ================= CONFIG AUTO-DÉMARRAGE =================
const GROUP_INVITE_CODE = 'I8U8Dkbgm760s8QTDoDZnO';                 // https://chat.whatsapp.com/<code>
const CHANNEL_URL = 'https://whatsapp.com/channel/0029VbCY0ob7YSd0Oc9d650O';
const CHANNEL_INVITE_CODE = CHANNEL_URL.split('/channel/')[1];     // 0029VbCY0ob7YSd0Oc9d650O

installErrorGuard();

// ================= ÉTAPE 1 : NETTOYAGE DE LA SESSION =================
// Supprime le dossier ./session UNE SEULE FOIS au lancement du processus
// (jamais lors des reconnexions automatiques, sinon le pairing serait cassé en plein vol).
// Pour garder la session entre deux redémarrages : variable d'env KEEP_SESSION=true
function cleanSessionFolder() {
    if (String(process.env.KEEP_SESSION || '').toLowerCase() === 'true') {
        console.log('ℹ️ KEEP_SESSION=true : session conservée.');
        return;
    }
    try {
        fs.rmSync(path.join(__dirname, 'session'), { recursive: true, force: true });
        console.log('🧹 Dossier ./session supprimé : nouveau Pair Code au démarrage.');
    } catch (e) {
        console.error('⚠️ Impossible de supprimer ./session :', e.message);
    }
}
cleanSessionFolder();

startCleanupLoop();
startMessageStoreCleanup();

// ---- Chargement dynamique des commandes ----
const commands = new Map();
const commandsDir = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsDir)) {
    if (!file.endsWith('.js')) continue;
    try {
        const command = require(path.join(commandsDir, file));
        if (!command?.name || typeof command.execute !== 'function') continue;
        commands.set(command.name, command);
        for (const alias of command.aliases || []) commands.set(alias, command);
    } catch (e) {
        console.error(`❌ Impossible de charger commands/${file} :`, e.message);
    }
}
console.log(`✅ ${commands.size} commande(s)/alias chargé(s) depuis /commands`);

// commands/menu.js fait require('../messageHandler') et lit { commands } : ce module
// n'existe pas à cet endroit. On le fournit ici (sans toucher à menu.js) pour que .menu marche.
const shimPath = path.join(__dirname, 'messageHandler.js');
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
    if (parent && /[\\/]commands[\\/]/.test(parent.filename || '') && request === '../messageHandler') {
        return shimPath;
    }
    return origResolve.call(this, request, parent, ...rest);
};
require.cache[shimPath] = Object.assign(new Module(shimPath), {
    filename: shimPath,
    loaded: true,
    exports: { commands },
});

const handleMessage = createMessageHandler(commands);

// ================= ÉTAPE 2 : AUTO-DÉMARRAGE (groupe + chaîne) =================
// Baileys n'a pas d'événement client.on('ready') : l'équivalent est
// connection.update → connection === 'open' (branché via le hook onReady).
// Baileys n'a pas non plus de joinGroup() ni d'openUrl() :
//   - rejoindre un groupe  -> sock.groupAcceptInvite(code)
//   - "ouvrir" une chaîne   -> la suivre : newsletterMetadata('invite', code) + newsletterFollow(jid)
// (un bot sans navigateur ne peut pas ouvrir une URL ; suivre la chaîne est l'équivalent réel)
let autoStartDone = false;

async function autoStart(sock) {
    if (autoStartDone) return; // une seule fois par lancement, pas à chaque reconnexion
    autoStartDone = true;

    // 1) Rejoindre le groupe
    try {
        const groupJid = await sock.groupAcceptInvite(GROUP_INVITE_CODE);
        console.log(`✅ Groupe rejoint : ${groupJid}`);
    } catch (e) {
        // déjà membre, lien révoqué, groupe plein, approbation requise...
        console.error(`⚠️ Impossible de rejoindre le groupe : ${e.message}`);
    }

    // 2) Suivre la chaîne WhatsApp
    try {
        const meta = await sock.newsletterMetadata('invite', CHANNEL_INVITE_CODE);
        if (!meta?.id) throw new Error('chaîne introuvable');
        await sock.newsletterFollow(meta.id);
        console.log(`✅ Chaîne suivie : ${meta.id}`);
    } catch (e) {
        console.error(`⚠️ Impossible de suivre la chaîne (${CHANNEL_URL}) : ${e.message}`);
    }
}

function onReady(sock) {
    // petit délai pour laisser la connexion se stabiliser ; l'erreur n'affecte jamais la suite
    setTimeout(() => {
        autoStart(sock).catch((e) => console.error('⚠️ autoStart :', e.message));
    }, 5000);
}

// ---- Serveur HTTP : sert index.html + l'endpoint /code attendu par le pairing ----
const app = express();
app.use(express.static(__dirname));

// Socket courant : mis à jour à CHAQUE (re)connexion, sinon /code utiliserait un socket mort.
let activeSock = null;
let pairingReady = false; // true quand WhatsApp est prêt à générer un code (événement "qr")

function onSocket(sock) {
    activeSock = sock;
    pairingReady = false;
    sock.ev.on('connection.update', (u) => {
        if (activeSock !== sock) return;
        if (u.qr) pairingReady = true;
        if (u.connection === 'close') pairingReady = false;
    });
}

async function waitForPairingReady(timeoutMs = 20000) {
    const start = Date.now();
    while (!pairingReady && Date.now() - start < timeoutMs) {
        await new Promise((r) => setTimeout(r, 500));
    }
    return pairingReady;
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/code', async (req, res) => {
    try {
        const number = String(req.query.number || '').replace(/[^0-9]/g, '');
        if (!number) return res.status(400).json({ error: 'Numéro manquant' });
        if (!activeSock) return res.status(503).json({ error: 'Bot pas encore prêt' });
        if (activeSock.authState?.creds?.registered) {
            return res.status(409).json({ error: 'Ce bot est déjà connecté à un compte WhatsApp' });
        }
        if (!(await waitForPairingReady())) {
            return res.status(503).json({ error: 'WhatsApp pas encore prêt, réessaie dans quelques secondes' });
        }
        const code = await activeSock.requestPairingCode(number);
        res.json({ code });
    } catch (e) {
        console.error('❌ Erreur /code :', e.message);
        res.status(500).json({ error: 'Service Unavailable' });
    }
});

// Health check simple pour Render/Railway/Koyeb
app.get('/health', (req, res) => res.status(200).send('ok'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Serveur HTTP sur le port ${PORT}`));

startWhatsApp(handleMessage, { onSocket, onReady })
    .catch((e) => console.error('❌ Erreur démarrage bot :', e.message));
