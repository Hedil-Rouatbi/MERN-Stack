// controllers/userController.js
const User = require('../models/userModel');
const Article = require('../models/articleModel');

// Message commun pour les identifiants mal formés (Exercice 2)
const MSG_CAST = 'Identifiant de ressource invalide (format ObjectId attendu)';

// 1. Récupérer tous les utilisateurs (filtre optionnel ?role=...)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filtre = role ? { role } : {};
    const users = await User.find(filtre);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Récupérer un utilisateur par son ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }
    res.status(200).json(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: MSG_CAST });
    }
    res.status(500).json({ message: err.message });
  }
};

// 3. Créer un utilisateur
const createUser = async (req, res) => {
  try {
    const { name, email, age, role, bio, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Le nom et l'email sont requis" });
    }

    // Vérification de doublon d'email → 409
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ message: 'Cet email est deja utilise' });
    }

    const user = await User.create({ name, email, age, role, bio, phone });
    res.status(201).json(user);
  } catch (err) {
    // Erreurs de validation du schéma (regex email, age min, enum, phone, bio...)
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    // Doublon détecté par l'index unique de MongoDB
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Cet email est deja utilise' });
    }
    res.status(500).json({ message: err.message });
  }
};

// 4. Supprimer un utilisateur (Exercice 1 : intégrité référentielle)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }

    // Interdire la suppression s'il a publié au moins un article
    const article = await Article.findOne({ author: id });
    if (article) {
      return res.status(400).json({
        message: 'Impossible de supprimer un utilisateur ayant des articles publies'
      });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'Utilisateur supprime avec succes', id });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: MSG_CAST });
    }
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser
};