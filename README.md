# Bot Gouichy V4

Cette version contient un serveur Express, un endpoint webhook et un moteur de commandes.

## Lancer
1. Installer Node.js.
2. `npm install`
3. Copier `.env.example` vers `.env`.
4. Renseigner les variables dans l'environnement du serveur.
5. `npm start`

Ne mets jamais un access token dans `public/`, dans le navigateur ou dans un dépôt public.

## Webhook
GET /webhook : vérification.
POST /webhook : réception des événements.

La partie WhatsApp réelle dépend de la configuration de ton compte WhatsApp Business Platform.
