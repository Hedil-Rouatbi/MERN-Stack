
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const articleRoutes = require('./routes/articleRoutes');
const userRoutes = require('./routes/userRoutes');

// Chargement des variables d’environnement (.env)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

// Montage des routeurs modulaires
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);

// Connexion asynchrone à MongoDB Atlas puis démarrage de l’écoute
(async () => {
    try {
        // 1. Établissement de la connexion distante
        await connectDB(process.env.MONGODB_URI);

        // 2. Démarrage de l’écoute du serveur HTTP
        app.listen(PORT, () => {
            console.log(`Serveur MERN en écoute sur http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Erreur critique de démarrage du serveur :', err.message);
        process.exit(1);
    }
})();
