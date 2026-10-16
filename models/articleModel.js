
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Le titre est obligatoire'],
            trim: true
        },
        content: {
            type: String,
            required: [true, 'Le contenu est obligatoire']
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "L’auteur (authorId) est obligatoire"]
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Article', articleSchema);
