# 👑 KING-MD — WhatsApp Bot

<p align="center">
  <strong>ROYAL AUTOMATION • GROUP MANAGEMENT • AI TOOLS</strong><br>
  <em>Un bot WhatsApp polyvalent conçu pour gérer, protéger et enrichir les conversations.</em>
</p>

---

## 1. Présentation

**KING-MD** est un bot WhatsApp développé en JavaScript avec Node.js et la bibliothèque Baileys. Il regroupe des outils d'administration de groupes, de modération, d'automatisation, de téléchargement de médias, de stickers, ainsi que des fonctions assistées par intelligence artificielle.

Le projet est organisé autour d'un point d'entrée (`index.js`), d'un ensemble de modules réutilisables (`lib/`) et de commandes indépendantes (`commands/`). L'archive fournie contient **150 fichiers de commandes JavaScript**.

> **Nom du projet :** KING-MD  
> **Identité :** KING STARK⁹⁹⁹  
> **Préfixe par défaut :** `.`  
> **Langage :** JavaScript  
> **Runtime :** Node.js 20.18.0 ou supérieur  
> **Connexion WhatsApp :** Pairing Code via la page web du projet

---

## 2. Fonctionnalités

Les commandes exactes disponibles dépendent des modules présents dans le dossier `commands/` et de leur configuration.

| Catégorie | Fonctions principales |
|---|---|
| 👑 Base & informations | Menu, ping, statut, uptime, statistiques, liens et support |
| ⚜️ Administration | Gestion des propriétaires, administrateurs et utilisateurs premium |
| 🏰 Groupes | Ajouter/retirer des membres, promouvoir, rétrograder, verrouiller et déverrouiller |
| 🛡️ Modération & sécurité | Avertissements, anti-lien, anti-spam, anti-bot, anti-tag et protections associées |
| 🤖 Automatisation | Bienvenue, messages de départ, réactions et actions automatiques |
| 🎨 Stickers & médias | Création de stickers, conversion et traitement de médias |
| 📥 Téléchargements | Outils liés à YouTube, TikTok, Instagram et autres sources prises en charge |
| 🧠 Intelligence artificielle | Assistant IA, traduction, résumé, reformulation, explication et aide au code |
| 🖼️ Outils image | Génération, suppression d'arrière-plan, amélioration et agrandissement — selon les API configurées |
| 🎭 Divertissement | Jeux, quiz, citations et commandes ludiques |
| 🌍 Outils divers | Heure, météo et autres utilitaires selon les services disponibles |

Certaines fonctions nécessitent une clé API externe. Leur présence dans le projet ne signifie donc pas qu'elles fonctionneront avant configuration.

---

## 3. Architecture du projet

```text
KING-MD/
├── assets/                 # Logo et ressources visuelles
├── commands/               # Commandes indépendantes du bot
├── data/                   # Paramètres et données locales
├── lib/                    # Modules internes et services partagés
├── index.js                # Point d'entrée et serveur HTTP
├── index.html              # Interface de pairing
├── pair.html               # Page de pairing
├── package.json            # Dépendances et scripts
├── render.yaml             # Configuration de déploiement Render
├── .env.example            # Exemple de variables d'environnement
└── README.md               # Documentation du projet
```

### Rôle des principaux fichiers

- `index.js` : charge les commandes, démarre le serveur HTTP et initialise WhatsApp.
- `lib/whatsapp.js` : gère la connexion Baileys, les événements et les reconnexions.
- `lib/messageHandler.js` : reçoit et distribue les messages aux commandes.
- `lib/menuCategories.js` : organise les catégories affichées dans le menu.
- `lib/i18n.js` : contient les traductions internes disponibles.
- `lib/aiClient.js` : communique avec une API compatible avec le format OpenAI Chat Completions.
- `lib/sessionString.js` : encode et restaure les identifiants de session.
- `data/` : contient les paramètres persistants du bot.

---

## 4. Prérequis

Avant l'installation, il faut disposer de :

- Node.js **20.18.0 ou supérieur** ;
- npm ;
- une connexion Internet stable ;
- un compte WhatsApp autorisé à connecter l'appareil ;
- les clés API correspondant aux fonctions que tu souhaites activer.

Pour un hébergement permanent, choisis un environnement qui conserve les fichiers nécessaires ou configure correctement la sauvegarde de session.

---

## 5. Installation

### Étape 1 — Récupérer le projet

Télécharge le dépôt ou décompresse l'archive KING-MD dans un dossier.

### Étape 2 — Installer les dépendances

Depuis le dossier du projet :

```bash
npm install
```

### Étape 3 — Configurer les variables

Copie `.env.example` vers `.env`, puis renseigne les valeurs nécessaires dans ton environnement.

Exemple :

```env
OWNER_NUMBER=509XXXXXXXX
PORT=3000

AI_API_URL=https://api.openai.com/v1/chat/completions
AI_API_KEY=TA_CLE_API
AI_MODEL=gpt-4o-mini

IMAGE_API_URL=
IMAGE_API_KEY=

REMOVEBG_API_KEY=

IMAGE_TOOLS_API_URL=
IMAGE_TOOLS_API_KEY=
```

`OWNER_NUMBER` doit contenir l'indicatif du pays et le numéro, sans `+`, espace ni tiret. Pour plusieurs propriétaires, sépare les numéros par des virgules.

Ne publie jamais le fichier `.env`, une clé API ou une session WhatsApp dans un dépôt public.

### Étape 4 — Démarrer le bot

```bash
npm start
```

Le serveur HTTP démarre sur le port défini par `PORT` (3000 par défaut). La page d'accueil sert à accéder au processus de pairing.

### Étape 5 — Connecter WhatsApp

1. Ouvre l'adresse publique de ton hébergement.
2. Saisis le numéro WhatsApp au format international demandé par l'interface.
3. Demande le Pairing Code.
4. Dans WhatsApp, ouvre **Appareils connectés** puis **Connecter un appareil**.
5. Suis l'option de connexion avec numéro de téléphone et saisis le code affiché.
6. Attends le message de confirmation de connexion.

Ne partage jamais le Pairing Code ni les identifiants de session.

---

## 6. Déploiement sur Render

Le dépôt contient déjà un fichier `render.yaml` prévu pour un service Node.js.

1. Envoie le projet dans un dépôt Git privé.
2. Dans Render, crée un **Web Service** relié à ce dépôt.
3. Vérifie les commandes :
   - Build : `npm install`
   - Start : `node index.js`
4. Configure les variables d'environnement nécessaires dans Render.
5. Déploie le service et consulte les journaux pour vérifier le démarrage.
6. Vérifie l'endpoint de santé : `https://TON-SERVICE.onrender.com/health`.

La réponse attendue de `/health` est `ok`.

### Attention à la persistance de la session

Dans la version actuelle, `index.js` supprime le dossier local `session/` au démarrage, sauf si la variable suivante est définie :

```env
KEEP_SESSION=true
```

Configure cette variable si tu veux conserver la session locale lors des redémarrages. Cela ne remplace pas un disque persistant ou une sauvegarde fiable : sur un hébergement dont le système de fichiers est éphémère, les fichiers locaux peuvent disparaître lors d'un redéploiement.

Le mécanisme `SESSION_ID` restaure le fichier `creds.json`, mais le code du projet précise que cela ne restaure pas toutes les clés de session Signal. Un nouveau pairing peut donc parfois être nécessaire. Teste la restauration avant de compter dessus en production.

---

## 7. Commandes et utilisation

Le préfixe par défaut est le point (`.`). Exemples de commandes à essayer, si elles sont disponibles et configurées :

```text
.menu
.ping
.alive
.uptime
.ai Bonjour
.translate fr Hello
.summarize
.sticker
.tiktok <lien>
.yt <lien>
```

Pour connaître les commandes réellement chargées par ton instance, utilise `.menu`. Les commandes réservées au propriétaire ou aux administrateurs nécessitent les permissions correspondantes.

Pour changer le préfixe, utilise la commande de configuration prévue par le bot, si elle est activée.

---

## 8. Variables d'environnement

| Variable | Utilité |
|---|---|
| `OWNER_NUMBER` | Numéro(s) du propriétaire |
| `SESSION_ID` | Données d'identification encodées pour restaurer partiellement une session |
| `SESSION_NUMBER` | Identifiant utilisé pour sélectionner le dossier de session |
| `KEEP_SESSION` | `true` pour ne pas supprimer le dossier local de session au démarrage |
| `AI_API_URL` | Adresse de l'API IA |
| `AI_API_KEY` | Clé d'accès à l'API IA |
| `AI_MODEL` | Modèle IA utilisé |
| `IMAGE_API_URL` | Endpoint de génération d'images |
| `IMAGE_API_KEY` | Clé de l'API image |
| `REMOVEBG_API_KEY` | Clé du service de suppression d'arrière-plan |
| `IMAGE_TOOLS_API_URL` | Endpoint des outils de traitement d'image |
| `IMAGE_TOOLS_API_KEY` | Clé de ces outils |
| `PORT` | Port du serveur HTTP |

Les variables inutilisées peuvent rester vides. Les services externes ont leurs propres conditions, limites et tarifs.

---

## 9. Sécurité et bonnes pratiques

- Garde le dépôt privé tant qu'il contient des informations sensibles ou des éléments de configuration.
- Ne publie jamais `.env`, `SESSION_ID`, le dossier `session/` ou un Pairing Code.
- Utilise un numéro dédié si possible et protège l'accès au compte WhatsApp.
- Limite les commandes sensibles aux propriétaires et administrateurs de confiance.
- Teste les commandes de modération dans un groupe de test avant de les activer dans une communauté.
- Sauvegarde `data/` et les données de session de façon sécurisée.
- Surveille les journaux du serveur et les erreurs des API externes.
- Respecte les règles de WhatsApp et les conditions d'utilisation des services tiers. Les bibliothèques non officielles peuvent être modifiées ou devenir incompatibles.

---

## 10. Dépannage

| Problème | Vérifications |
|---|---|
| Le service ne démarre pas | Vérifie Node.js 20.18+, `npm install` et les journaux |
| Pairing Code indisponible | Attends que WhatsApp soit prêt, puis réessaie |
| Numéro déjà connecté | Vérifie l'appareil WhatsApp et la session existante |
| Le bot se déconnecte après redémarrage | Vérifie `KEEP_SESSION=true` et la persistance du disque |
| Les commandes IA échouent | Vérifie `AI_API_KEY`, `AI_API_URL`, `AI_MODEL` et les crédits du fournisseur |
| Les outils image échouent | Vérifie les clés et endpoints de l'API concernée |
| Une commande ne répond pas | Vérifie `.menu`, le préfixe, les permissions et les logs |
| Le serveur répond mais WhatsApp est hors ligne | Vérifie la connexion Baileys et les événements dans les logs |

---

## 11. Roadmap — Évolution de KING-MD

Cette feuille de route est une proposition de développement. Elle ne signifie pas que les améliorations listées sont déjà implémentées.

### PHASE 1 — Stabilisation
- [ ] Tester chaque commande et corriger les erreurs.
- [ ] Vérifier les permissions propriétaire, admin et utilisateur.
- [ ] Fiabiliser les reconnexions et la persistance des sessions.
- [ ] Vérifier la compatibilité Node.js et Baileys.
- [ ] Ajouter une gestion cohérente des erreurs et des limites API.
- [ ] Documenter les commandes avec leurs paramètres et permissions.

### PHASE 2 — Sécurité & administration
- [ ] Renforcer la protection des commandes sensibles.
- [ ] Ajouter une validation des entrées utilisateur.
- [ ] Améliorer les protections anti-spam et anti-lien.
- [ ] Ajouter des journaux d'administration configurables.
- [ ] Prévoir des sauvegardes et une restauration des paramètres.
- [ ] Ajouter des limites d'utilisation pour éviter les abus.

### PHASE 3 — Expérience utilisateur
- [ ] Uniformiser le menu et les descriptions des commandes.
- [ ] Compléter les traductions français, anglais et espagnol.
- [ ] Améliorer les messages d'aide et les exemples.
- [ ] Ajouter une configuration simple des fonctions activables.
- [ ] Améliorer l'interface mobile de pairing et l'affichage des erreurs.

### PHASE 4 — Intelligence artificielle & médias
- [ ] Rendre la configuration des fournisseurs IA plus simple.
- [ ] Ajouter des contrôles de taille, format et durée pour les médias.
- [ ] Améliorer les retours d'erreur des services externes.
- [ ] Ajouter des quotas configurables et un suivi de consommation.
- [ ] Tester chaque intégration avant de l'annoncer comme disponible.

### PHASE 5 — Qualité & publication
- [ ] Ajouter des tests automatisés pour les modules essentiels.
- [ ] Mettre en place une vérification continue avant déploiement.
- [ ] Maintenir une documentation des versions et changements.
- [ ] Préparer une procédure de mise à jour et de retour arrière.
- [ ] Publier une version stable après validation complète.

---

## 12. Contribution

Pour contribuer :

1. Crée une branche dédiée à ta modification.
2. Garde chaque commande indépendante dans `commands/`.
3. Place les fonctions partagées dans `lib/`.
4. Vérifie que le bot démarre et que les commandes concernées fonctionnent.
5. Décris clairement les changements et les variables nécessaires.

N'ajoute jamais de clé secrète ou de session WhatsApp dans une contribution.

---

## 13. Licence & avertissement

Aucune licence open source n'est déclarée dans l'archive fournie. Demande l'autorisation du propriétaire avant de redistribuer, modifier ou republier le projet.

KING-MD est un projet indépendant et n'est pas un produit officiel de WhatsApp. WhatsApp est une marque de Meta. L'utilisation de bibliothèques non officielles peut comporter des risques de compatibilité et de conformité.

---

<p align="center">
  **KING-MD — THE ROYAL WHATSAPP EXPERIENCE**<br>
  <strong>BY : KING STARK⁹⁹⁹</strong>
</p>
