
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
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Format d’email invalide (ex: aya@polytechnique.tn)"
            ]
        },
        age: {
            type: Number,
            min: [4, "L’âge minimum autorisé est de 4 ans"]
        },
        role: {
            type: String,
            enum: {
                values: ['user', 'admin'],
                message: "{VALUE} n’est pas un rôle autorisé"
            },
            default: 'user'
        },
        bio: {
            type: String,
            maxlength: [
                200,
                'La biographie ne peut pas dépasser 200 caractères'
            ]
        },
        phone: {
            type: String,
            match: [
                /^\d{8}$/,
                'Numéro de 8 chiffres requis'
            ]
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
