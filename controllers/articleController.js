const Article = require('../models/articleModel');

// GET /api/articles (Tous les articles)
const getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find().populate(
            'author',
            'name email role'
        );

        res.status(200).json(articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/articles/:id (Un article par ID)
const getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate(
            'author',
            'name email role'
        );

        if (!article) {
            return res.status(404).json({
                message: 'Article non trouve'
            });
        }

        res.status(200).json(article);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Identifiant invalide'
            });
        }

        res.status(500).json({ message: err.message });
    }
};

// POST /api/articles (Creation protegee)
const createArticle = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: 'Titre et contenu obligatoires'
            });
        }

        // L'auteur est extrait du token verifie
        const newArticle = await Article.create({
            title,
            content,
            author: req.user._id
        });

        const populated = await newArticle.populate(
            'author',
            'name email role'
        );

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/articles/:id (Modification protegee : auteur ou admin)
const updateArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                message: 'Article non trouve'
            });
        }

        // Verification des droits de propriete
        if (
            article.author.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message: "Action interdite : vous n'etes pas l'auteur de cet article"
            });
        }

        article.title = req.body.title || article.title;
        article.content = req.body.content || article.content;

        const updated = await article.save();

        const populated = await updated.populate(
            'author',
            'name email role'
        );

        res.status(200).json(populated);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Identifiant invalide'
            });
        }

        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/articles/:id (Suppression protegee : auteur ou admin)
const deleteArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                message: 'Article non trouve'
            });
        }

        if (
            article.author.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message: "Action interdite : vous n'etes pas l'auteur de cet article"
            });
        }

        await Article.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'Article supprime avec succes',
            id: req.params.id
        });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Identifiant invalide'
            });
        }

        res.status(500).json({ message: err.message });
    }
};

// GET /api/articles/my-articles (Articles de l'utilisateur connecte)
const getMyArticles = async (req, res) => {
    try {
        const articles = await Article.find({ author: req.user._id })
            .populate('author', 'name email role')
            .sort({ createdAt: -1 });

        res.status(200).json(articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Exportation des cinq fonctions
module.exports = {
    getAllArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    getMyArticles
};