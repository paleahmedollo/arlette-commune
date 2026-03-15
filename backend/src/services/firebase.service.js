const admin = require('firebase-admin');

let initialized = false;

const initFirebase = () => {
  if (initialized) return;
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn('⚠️  Firebase non configuré — notifications push désactivées');
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
  initialized = true;
  console.log('✅ Firebase initialisé');
};

/**
 * Envoyer une notification push à un utilisateur via son FCM token
 */
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!initialized || !fcmToken) return;

  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } }
    });
  } catch (error) {
    console.error('Erreur notification push :', error.message);
  }
};

module.exports = { initFirebase, sendPushNotification };
