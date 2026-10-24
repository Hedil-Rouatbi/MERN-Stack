const express = require('express');
const router = express.Router();

const {
    getAllArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    getMyArticles
} = require('../controllers/articleController');

const { protect } = require('../middlewares/authMiddleware');

// Consultation publique
router.get('/', getAllArticles);

// Articles personnels (protegee) - DOIT etre avant '/:id'
router.get('/my-articles', protect, getMyArticles);

router.get('/:id', getArticleById);

// Operations d'ecriture protegees par authentification JWT
router.post('/', protect, createArticle);
router.put('/:id', protect, updateArticle);
router.delete('/:id', protect, deleteArticle);

module.exports = router;