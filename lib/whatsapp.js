// Tout ce qui concerne la connexion Baileys elle-même (ouverture, reconnexion,
// sauvegarde des identifiants). Séparé d'index.js pour que ce dernier reste un
// simple point d'entrée, et de lib/messageHandler.js qui s'occupe seulement du
// contenu des messages une fois reçus.
const fs = require('fs');
const path = require('path');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
    Browsers,
} = require('@whiskeysockets/baileys');

const { sendConnectionConfirmation } = require('./connectionMessage');
const { restoreSession } = require('./sessionString');

function getSessionDir() {
    return path.join(__dirname, '..', 'session', process.env.SESSION_NUMBER || 'default');
}

// Si une SESSION_ID est fournie par variable d'env et qu'il n'y a pas encore de
// session locale, on la restaure AVANT d'ouvrir useMultiFileAuthState.
// ⚠️ Ça restaure creds.json (l'identité), pas le dossier complet des clés de
// session signal. Dans la pratique ça suffit le plus souvent à éviter un re-scan
// complet, mais un re-pairing occasionnel après une longue coupure reste possible
// — non vérifié en conditions réelles.
function restoreSessionIfNeeded() {
    const sessionDir = getSessionDir();
    if (process.env.SESSION_ID && !fs.existsSync(path.join(sessionDir, 'creds.json'))) {
        restoreSession(sessionDir, process.env.SESSION_ID);
    }
    return sessionDir;
}

// onMessage(sock, m) est fourni par index.js (branché sur lib/messageHandler.js).
// hooks (optionnels, fournis par index.js) :
//   onSocket(sock) : appelé à CHAQUE nouveau socket (y compris après reconnexion)
//   onReady(sock)  : appelé à chaque fois que la connexion passe à "open"
async function startWhatsApp(onMessage, hooks = {}) {
    const sessionDir = restoreSessionIfNeeded();
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        browser: Browsers.macOS('KING-MD'),
        printQRInTerminal: false, // ce projet utilise le pairing code (index.html), pas le QR
    });

    sock.ev.on('creds.update', saveCreds);
    try { hooks.onSocket && hooks.onSocket(sock); } catch (e) { console.error('Erreur hook onSocket :', e.message); }

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log('🟢 Connecté à WhatsApp');
            sendConnectionConfirmation(sock).catch((e) => console.error(e.message));
            try { hooks.onReady && hooks.onReady(sock); } catch (e) { console.error('Erreur hook onReady :', e.message); }
        }
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const loggedOut = statusCode === DisconnectReason.loggedOut;
            console.log(`🔴 Connexion fermée (code ${statusCode}). Reconnexion automatique`);
            if (loggedOut) {
                // Session révoquée/invalide : on la supprime pour repartir sur un nouveau pairing propre
                try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch (e) {}
                delete process.env.SESSION_ID; // sinon l ancienne session invalide serait restaurée en boucle
                console.log('🧹 Session invalide supprimée — nouveau pairing nécessaire');
            }
            setTimeout(() => {
                startWhatsApp(onMessage, hooks).catch((e) => console.error('Erreur reconnexion :', e.message));
            }, loggedOut ? 1000 : 3000);
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        for (const m of messages) {
            try {
                await onMessage(sock, m);
            } catch (e) {
                console.error('❌ Erreur traitement message :', e.message);
            }
        }
    });

    return sock;
}

module.exports = { startWhatsApp, getSessionDir };
