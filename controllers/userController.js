const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Utilitaire de generation de Token JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
};

// POST /api/users/register (Inscription)
const registerUser = async (req, res) => {
    try {
        // "role" n'est plus lu depuis le body (protection contre l'escalade de privileges)
        const { name, email, password, age } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Nom, email et mot de passe requis'
            });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(409).json({
                message: 'Cet email est deja utilise'
            });
        }

        // Hachage securise avec sel (Salt factor = 10)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            age,
            role: 'user' // Toujours 'user' lors de l'inscription publique
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }

        res.status(500).json({ message: err.message });
    }
};

// POST /api/users/login (Connexion)
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email et mot de passe requis'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: 'Identifiants invalides'
            });
        }

        // Comparaison securisee en temps constant
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Identifiants invalides'
            });
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/users/profile (Profil protege)
const getUserProfile = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/users (Admin uniquement)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/users/update-password (Modification protegee du mot de passe)
const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Verifier la presence des deux champs (evite un crash de bcrypt.compare)
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: 'Ancien et nouveau mot de passe requis'
            });
        }

        // Recuperer l'utilisateur connecte (avec son mot de passe)
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur introuvable'
            });
        }

        // Verifier l'ancien mot de passe
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Ancien mot de passe incorrect'
            });
        }

        // Verifier la longueur du nouveau mot de passe
        if (newPassword.length < 6) {
            return res.status(400).json({
                message: 'Le nouveau mot de passe doit contenir au moins 6 caracteres'
            });
        }

        // Generer un nouveau sel et hacher le mot de passe
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        return res.status(200).json({
            message: 'Mot de passe mis a jour avec succes'
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// PUT /api/users/:id/role (Admin uniquement)
const updateUserRole = async (req, res) => {
    try {
        const role = req.body.role || 'admin';

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                message: 'Role invalide (user ou admin)'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur introuvable'
            });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            message: `Role de ${user.name} mis a jour : ${user.role}`,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });

    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Identifiant invalide' });
        }
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers,
    updatePassword,
    updateUserRole
};