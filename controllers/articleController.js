
const Article = require('../models/articleModel');
const User = require('../models/userModel');

// 1. Récupérer tous les articles avec les données complètes de l’auteur
const getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find().populate('author', 'name email');
        res.status(200).json(articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Créer un nouvel article lié à un auteur
const createArticle = async (req, res) => {
    try {
        const { title, content, authorId } = req.body;

        if (!title || !content || !authorId) {
            return res.status(400).json({
                message: 'title, content et authorId sont obligatoires'
            });
        }

        // Vérifier l’existence réelle de l’auteur dans la collection users
        const author = await User.findById(authorId);

        if (!author) {
            return res.status(404).json({
                message: 'Auteur non trouvé (identifiant authorId invalide)'
            });
        }

        const newArticle = await Article.create({
            title,
            content,
            author: authorId
        });

        const populatedArticle = await newArticle.populate('author', 'name email');

        res.status(201).json(populatedArticle);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. Récupérer un article unique par son ID
const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('author', 'name email');
    if (!article) {
      return res.status(404).json({ message: 'Article non trouve' });
    }
    res.status(200).json(article);
  } catch (err) {
    // Identifiant mal formé (pas un ObjectId valide de 24 caractères hexadécimaux)
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Identifiant de ressource invalide (format ObjectId attendu)'
      });
    }
    res.status(500).json({ message: err.message });
  }
};

// 3. Obtenir un utilisateur par son identifiant (GET /api/users/:id)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }
    res.status(200).json(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Identifiant de ressource invalide (format ObjectId attendu)'
      });
    }
    res.status(500).json({ message: err.message });
  }
};

// 4. Mettre à jour un article (PUT /api/articles/:id)
const updateArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!article) {
            return res.status(404).json({
                message: 'Article introuvable pour la mise à jour'
            });
        }

        const populated = await article.populate('author', 'name email');

        res.status(200).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 5. Supprimer un article (DELETE /api/articles/:id)
const deleteArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);

        if (!article) {
            return res.status(404).json({
                message: 'Article introuvable pour la suppression'
            });
        }

        res.status(200).json({
            message: 'Article supprimé avec succès',
            id: req.params.id
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Exporter les fonctions du contrôleur
module.exports = {
    getAllArticles,
    createArticle,
    getArticleById,
    updateArticle,
    deleteArticle
};
