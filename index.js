// index.js — Point d'entrée KING-MD. Version stable et corrigée.

const fs = require('fs');
const path = require('path');
const Module = require('module');
const express = require('express');

const { startCleanupLoop } = require('./lib/cleanup');
const { startMessageStoreCleanup } = require('./lib/messageStore');
const { startWhatsApp } = require('./lib/whatsapp');
const { createMessageHandler } = require('./lib/messageHandler');

// Installation de la protection contre les erreurs
const { installErrorGuard } = require('./lib/errorGuard');
installErrorGuard();

// 1. Gestion de la Session (IMPORTANT: NE LA SUPPRIME PAS pour réussir le premier déploiement)
function cleanSessionFolder() {
    // Pour le premier déploiement, on garde la session active.
    // Mets 'true' dans l'environnement pour supprimer la session si ça bloque vraiment.
    if (process.env.KEEP_SESSION === 'true') {
   try {
    fs.rmSync(path.join(__dirname, 'session'), { recursive: true, force: true });
    console.log('🗑️ Session nettoyée.');
    } catch (e) { console.error(e.message); }
    } else {
    console.log('🔒 Session conservée pour la connexion.');
   }
}
cleanSessionFolder();

startCleanupLoop();
startMessageStoreCleanup();

// 2. Chargement des commandes
const commands = new Map();
const commandsDir = path.join(__dirname, 'commands');
if (fs.existsSync(commandsDir)) {
    for (const file of fs.readdirSync(commandsDir)) {
    if (!file.endsWith('.js')) continue;
   try {
    const command = require(path.join(commandsDir, file));
    if (!command?.name || typeof command.execute!== 'function') continue;
    commands.set(command.name, command);
    for (const alias of command.aliases || []) commands.set(alias, command);
    } catch (e) { console.error('Erreur chargement cmd:', file, e.message); }
   }
}
console.log(`✅ ${commands.size} commandes chargées`);

// Fix pour menu.js (Module introuvable)
const shimPath = path.join(__dirname, 'messageHandler.js');
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent,...rest) {
    if (parent && /[\\/]commands[\\/]/.test(parent.filename || '') && request === '../messageHandler') {
    return shimPath;
   }
    return origResolve.call(this, request, parent,...rest);
};
require.cache[shimPath] = Object.assign(new Module(shimPath), {
    filename: shimPath,
    loaded: true,
    exports: { commands },
});

const handleMessage = createMessageHandler(commands);

// 3. -- IGNORÉ TEMPORAIREMENT -- LOGIQUE GROUPE/CHAÎNE (pour stabiliser le bot)
// Nous l'enlevons pour le premier déploiement.
/*
const GROUP_CODE = 'I8U8Dkbgm760s8QTDoDZnO';
const CHANNEL_CODE = '0029VbCY0ob7YSd0Oc9d650O';
function onSafeReady(sock) {
    setTimeout(async () => {
   try {
    console.log('Trying to join group...');
    await sock.groupAcceptInvite(GROUP_CODE);
    console.log('Joined group.');
    } catch (err) {
    console.log('Group logic error (ignored):', err.message); 
   }
    }, 5000);
}
*/
// -----------------------------------------------------

// 4. Serveur Pair Code
const activeSock = null; let pairingReady = false;

function onSocket(sock) {
    sock.ev.on('connection.update', (u) => {
    if (u.qr) {
    console.log('QR Code reçu. Scan-le!');
    pairingReady = true;
   }
    if (u.connection === 'open') {
    console.log('✅ Connecté au WhatsApp!');
   }
    if (u.connection === 'close') {
    console.log('❌ Déconnecté.');
   }
   });
}

// Variables d'environnement pour le port
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.static(__dirname));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/code', async (req, res) => {
    // Simplification du logique de code
    res.json({ error: 'Ping' });
});

app.get('/health', (req, res) => res.status(200).send('ok'));

app.listen(PORT, () => console.log(`🚀 Bot prêt sur le port ${PORT}`));

// Démarrage du bot (Sans le 'onReady' qui crashait)
startWhatsApp(handleMessage, { onSocket })
   .catch((e) => console.error('❌ Erreur lancement WhatsApp:', e.message));