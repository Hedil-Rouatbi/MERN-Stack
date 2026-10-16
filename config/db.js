
const mongoose = require('mongoose');

async function connectDB(uri) {
    if (!uri) {
        throw new Error(
            "L’URI MongoDB est manquant dans les variables d’environnement (.env)"
        );
    }

    await mongoose.connect(uri, {
        autoIndex: true // Génère automatiquement les index (ex: unique) en développement
    });

    console.log('Connexion à MongoDB Atlas réussie avec succès !');
}

module.exports = connectDB;
