require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/communes',    require('./routes/communes.routes'));
app.use('/api/structures',  require('./routes/structures.routes'));
app.use('/api/reports',     require('./routes/reports.routes'));
app.use('/api/tickets',     require('./routes/tickets.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Arlette Ma Commune API', version: '1.0.0' });
});

// ── Migrations auto ───────────────────────────────────────
async function runMigrations() {
  const migrations = [
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP`,
    `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium'`,
  ];

  for (const sql of migrations) {
    try {
      await sequelize.query(sql);
    } catch (e) {
      console.warn('Migration ignorée :', e.message);
    }
  }
}

// ── Seed communes Côte d'Ivoire ───────────────────────────
async function seedCommunes() {
  const { Commune } = require('./models');
  const count = await Commune.count();
  if (count > 0) return;

  const communes = [
    { name: 'Abobo', city: 'Abidjan', region: 'Lagunes', latitude: 5.4319, longitude: -4.0083 },
    { name: 'Adjamé', city: 'Abidjan', region: 'Lagunes', latitude: 5.3600, longitude: -4.0167 },
    { name: 'Attécoubé', city: 'Abidjan', region: 'Lagunes', latitude: 5.3500, longitude: -4.0333 },
    { name: 'Cocody', city: 'Abidjan', region: 'Lagunes', latitude: 5.3536, longitude: -3.9792 },
    { name: 'Koumassi', city: 'Abidjan', region: 'Lagunes', latitude: 5.3000, longitude: -3.9833 },
    { name: 'Marcory', city: 'Abidjan', region: 'Lagunes', latitude: 5.3000, longitude: -3.9667 },
    { name: 'Plateau', city: 'Abidjan', region: 'Lagunes', latitude: 5.3167, longitude: -4.0167 },
    { name: 'Port-Bouët', city: 'Abidjan', region: 'Lagunes', latitude: 5.2667, longitude: -3.9333 },
    { name: 'Treichville', city: 'Abidjan', region: 'Lagunes', latitude: 5.3000, longitude: -4.0000 },
    { name: 'Yopougon', city: 'Abidjan', region: 'Lagunes', latitude: 5.3667, longitude: -4.0667 },
    { name: 'Bingerville', city: 'Abidjan', region: 'Lagunes', latitude: 5.3583, longitude: -3.8833 },
    { name: 'Songon', city: 'Abidjan', region: 'Lagunes', latitude: 5.4000, longitude: -4.2333 },
    { name: 'Anyama', city: 'Abidjan', region: 'Lagunes', latitude: 5.5000, longitude: -4.0500 },
    { name: 'Bouaké', city: 'Bouaké', region: 'Vallée du Bandama', latitude: 7.6900, longitude: -5.0300 },
    { name: 'Korhogo', city: 'Korhogo', region: 'Poro', latitude: 9.4500, longitude: -5.6333 },
    { name: 'San-Pédro', city: 'San-Pédro', region: 'San-Pédro', latitude: 4.7500, longitude: -6.6333 },
    { name: 'Yamoussoukro', city: 'Yamoussoukro', region: 'Lacs', latitude: 6.8167, longitude: -5.2833 },
    { name: 'Daloa', city: 'Daloa', region: 'Haut-Sassandra', latitude: 6.8833, longitude: -6.4500 },
    { name: 'Man', city: 'Man', region: 'Tonkpi', latitude: 7.4000, longitude: -7.5500 },
    { name: 'Abengourou', city: 'Abengourou', region: 'Indénié-Djuablin', latitude: 6.7333, longitude: -3.4833 },
    { name: 'Divo', city: 'Divo', region: 'Lôh-Djiboua', latitude: 5.8333, longitude: -5.3667 },
    { name: 'Gagnoa', city: 'Gagnoa', region: 'Gôh', latitude: 6.1333, longitude: -5.9500 },
    { name: 'Soubré', city: 'Soubré', region: 'Nawa', latitude: 5.7833, longitude: -6.6000 },
    { name: 'Odienné', city: 'Odienné', region: 'Kabadougou', latitude: 9.5000, longitude: -7.5667 },
    { name: 'Touba', city: 'Touba', region: 'Bafing', latitude: 8.2833, longitude: -7.6833 },
    { name: 'Séguéla', city: 'Séguéla', region: 'Worodougou', latitude: 7.9667, longitude: -6.6667 },
    { name: 'Ouangolo', city: 'Ouangolo', region: 'Poro', latitude: 9.9833, longitude: -5.2000 },
    { name: 'Ferkessédougou', city: 'Ferkessédougou', region: 'Hambol', latitude: 9.5833, longitude: -5.1833 },
    { name: 'Bondoukou', city: 'Bondoukou', region: 'Gontougo', latitude: 8.0333, longitude: -2.8000 },
    { name: 'Dimbokro', city: 'Dimbokro', region: 'N\'Zi', latitude: 6.6500, longitude: -4.7000 },
  ];

  await Commune.bulkCreate(communes);
  console.log(`✅ ${communes.length} communes Côte d'Ivoire insérées`);
}

// ── Seed structures par défaut ────────────────────────────
async function seedStructures() {
  const { Structure } = require('./models');
  const count = await Structure.count();
  if (count > 0) return;

  const structures = [
    { name: 'Mairie', type: 'mairie', categories: ['route', 'lampadaire', 'dechets', 'transport', 'autre'] },
    { name: 'Police Nationale', type: 'police', categories: ['securite'] },
    { name: 'SODECI', type: 'sodeci', categories: ['eau'] },
    { name: 'CIE', type: 'cie', categories: ['electricite', 'lampadaire'] },
    { name: 'SAPEUR-POMPIERS', type: 'pompiers', categories: ['sante'] },
    { name: 'Ministère de la Santé', type: 'sante', categories: ['sante'] },
  ];

  await Structure.bulkCreate(structures);
  console.log(`✅ ${structures.length} structures insérées`);
}

// ── Démarrage ─────────────────────────────────────────────
async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Base de données connectée');

    await sequelize.sync({ alter: false });
    console.log('✅ Modèles synchronisés');

    await runMigrations();
    await seedCommunes();
    await seedStructures();

    app.listen(PORT, () => {
      console.log(`🚀 Arlette Ma Commune API — port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur démarrage :', error);
    process.exit(1);
  }
}

start();
