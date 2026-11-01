// Encode / restaure creds.json en une chaîne base64 (SESSION_ID).
// Fichier qui manquait dans l'archive : sans lui, `require('./sessionString')`
// plantait lib/whatsapp.js et donc tout le bot au démarrage.
const fs = require('fs');
const path = require('path');

function encodeSession(sessionDir) {
    const credsPath = path.join(sessionDir, 'creds.json');
    if (!fs.existsSync(credsPath)) return null;
    return Buffer.from(fs.readFileSync(credsPath, 'utf8'), 'utf8').toString('base64');
}

function restoreSession(sessionDir, sessionId) {
    try {
        const json = Buffer.from(String(sessionId).trim(), 'base64').toString('utf8');
        JSON.parse(json); // vérifie que c'est bien du JSON valide
        fs.mkdirSync(sessionDir, { recursive: true });
        fs.writeFileSync(path.join(sessionDir, 'creds.json'), json);
        return true;
    } catch (e) {
        console.error('❌ SESSION_ID invalide, ignorée :', e.message);
        return false;
    }
}

module.exports = { encodeSession, restoreSession };
