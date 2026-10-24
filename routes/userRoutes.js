const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers,
    updatePassword
} = require('../controllers/userController');

const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Route sécurisée de mise à jour du mot de passe
router.put('/update-password', protect, updatePassword);

// Routes d'authentification publiques
router.post('/register', registerUser);
router.post('/login', loginUser);

// Route privee protegee par Token JWT
router.get('/profile', protect, getUserProfile);

// Route reservee aux administrateurs (JWT valide + role admin requis)
router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;





