const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Commune } = require('../models');

const generateToken = (user) => jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, phone, email, password, commune_id } = req.body;

    if (!first_name || !last_name || !phone || !password) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const existing = await User.findOne({ where: { phone } });
    if (existing) {
      return res.status(409).json({ message: 'Ce numéro est déjà utilisé' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({
      first_name, last_name, phone, email,
      password_hash, commune_id,
      otp_code: otp,
      otp_expires_at,
      is_phone_verified: false
    });

    // TODO: Envoyer OTP par SMS via Africa's Talking
    console.log(`OTP pour ${phone} : ${otp}`);

    res.status(201).json({
      message: 'Compte créé. Vérifiez votre téléphone pour le code OTP.',
      user_id: user.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// POST /api/auth/send-otp
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ where: { phone } });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    const otp = generateOtp();
    await user.update({
      otp_code: otp,
      otp_expires_at: new Date(Date.now() + 10 * 60 * 1000)
    });

    // TODO: SMS Africa's Talking
    console.log(`OTP renouvelé pour ${phone} : ${otp}`);

    res.json({ message: 'Code OTP envoyé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ where: { phone } });

    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (user.otp_code !== otp) return res.status(400).json({ message: 'Code OTP incorrect' });
    if (new Date() > user.otp_expires_at) return res.status(400).json({ message: 'Code OTP expiré' });

    await user.update({ is_phone_verified: true, otp_code: null, otp_expires_at: null });

    const token = generateToken(user);
    res.json({ message: 'Téléphone vérifié', token, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({
      where: { phone },
      include: [{ model: require('../models').Commune, as: 'commune' }]
    });

    if (!user) return res.status(401).json({ message: 'Identifiants incorrects' });
    if (!user.is_active) return res.status(403).json({ message: 'Compte désactivé' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Identifiants incorrects' });

    const token = generateToken(user);
    res.json({ token, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: require('../models').Commune, as: 'commune' }]
    });
    res.json(formatUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, email, commune_id } = req.body;
    await req.user.update({ first_name, last_name, email, commune_id });
    res.json({ message: 'Profil mis à jour', user: formatUser(req.user) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /api/auth/fcm-token
exports.updateFcmToken = async (req, res) => {
  try {
    const { fcm_token } = req.body;
    await req.user.update({ fcm_token });
    res.json({ message: 'Token FCM mis à jour' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const formatUser = (user) => ({
  id: user.id,
  first_name: user.first_name,
  last_name: user.last_name,
  phone: user.phone,
  email: user.email,
  role: user.role,
  commune: user.commune || null,
  is_phone_verified: user.is_phone_verified,
  avatar_url: user.avatar_url
});
