const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { User, Commune } = require('../models');

const generateToken = (user) => jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /auth/register
const register = async (req, res) => {
  try {
    const { first_name, last_name, phone, email, password, commune_id } = req.body;

    if (!first_name || !last_name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }

    const existing = await User.findOne({ where: { phone } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Ce numéro est déjà utilisé' });
    }

    if (email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé' });
    }

    if (commune_id) {
      const commune = await Commune.findByPk(commune_id);
      if (!commune) return res.status(404).json({ success: false, message: 'Commune introuvable' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      first_name,
      last_name,
      phone,
      email: email || null,
      password_hash,
      commune_id: commune_id || null,
      otp,
      otp_expires_at,
      is_verified: false
    });

    // TODO: Envoyer OTP via Africa's Talking
    console.log(`📱 OTP pour ${phone}: ${otp}`);

    res.status(201).json({
      success: true,
      message: 'Compte créé. Vérifiez votre téléphone pour le code OTP.',
      data: { user_id: user.id, phone: user.phone }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// POST /auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ where: { phone } });

    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: 'Code OTP incorrect' });
    if (new Date() > user.otp_expires_at) return res.status(400).json({ success: false, message: 'Code OTP expiré' });

    await user.update({ is_verified: true, otp: null, otp_expires_at: null });

    const token = generateToken(user);
    res.json({
      success: true,
      message: 'Compte vérifié avec succès',
      data: { token, user: { id: user.id, first_name: user.first_name, last_name: user.last_name, phone: user.phone, role: user.role } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// POST /auth/login
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Téléphone et mot de passe requis' });
    }

    const user = await User.findOne({ where: { phone }, include: [{ association: 'commune' }] });
    if (!user) return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    if (!user.is_active) return res.status(403).json({ success: false, message: 'Compte désactivé' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    if (!user.is_verified) {
      // Renvoyer un nouvel OTP
      const otp = generateOTP();
      await user.update({ otp, otp_expires_at: new Date(Date.now() + 10 * 60 * 1000) });
      console.log(`📱 OTP renvoyé pour ${phone}: ${otp}`);
      return res.status(403).json({
        success: false,
        message: 'Compte non vérifié. Un nouveau code OTP a été envoyé.',
        data: { needs_verification: true }
      });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          commune: user.commune
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// POST /auth/resend-otp
const resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ where: { phone } });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });

    const otp = generateOTP();
    await user.update({ otp, otp_expires_at: new Date(Date.now() + 10 * 60 * 1000) });
    console.log(`📱 OTP renvoyé pour ${phone}: ${otp}`);

    res.json({ success: true, message: 'Code OTP renvoyé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// PUT /auth/update-fcm-token
const updateFcmToken = async (req, res) => {
  try {
    const { fcm_token } = req.body;
    await req.user.update({ fcm_token });
    res.json({ success: true, message: 'Token FCM mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// GET /auth/me
const getMe = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [{ association: 'commune' }],
    attributes: { exclude: ['password_hash', 'otp', 'otp_expires_at'] }
  });
  res.json({ success: true, data: user });
};

module.exports = { register, verifyOTP, login, resendOTP, updateFcmToken, getMe };
