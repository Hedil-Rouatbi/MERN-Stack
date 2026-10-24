const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Le nom est obligatoire'],
            trim: true
        },
        email: {
            type: String,
            required: [true, "L’email est obligatoire"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Format d’email invalide"]
        },
        password: {
            type: String,
            required: [true, 'Le mot de passe est obligatoire'],
            minlength: [6, 'Le mot de passe doit comporter au moins 6 caractères']
        },
        role: {
            type: String,
            enum: {
                values: ['user', 'admin'],
                message: "{VALUE} n'est pas un rôle autorisé"
            },
            default: 'user'
        },
        age: {
            type: Number,
            min: [4, "L’âge minimum autorisé est de 4 ans"]
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);