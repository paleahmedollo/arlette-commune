// Couleurs de l'application
export const COLORS = {
  primary: '#1B5E20',       // Vert foncé (couleur principale)
  primaryLight: '#4CAF50',  // Vert clair
  secondary: '#FF6F00',     // Orange (CTA signalement)
  background: '#F5F5F5',
  white: '#FFFFFF',
  black: '#212121',
  gray: '#757575',
  lightGray: '#EEEEEE',
  error: '#D32F2F',
  success: '#2E7D32',
  warning: '#F57F17',
  info: '#1565C0',

  // Statuts tickets
  received:    '#FF6F00',   // Orange
  in_progress: '#1565C0',   // Bleu
  resolved:    '#2E7D32',   // Vert
  rejected:    '#D32F2F',   // Rouge
};

// URL de l'API backend
export const API_URL = __DEV__
  ? 'http://192.168.1.XXX:3001/api'   // ← Remplacer par votre IP locale en dev
  : 'https://arlette-commune-api.onrender.com/api';

// Catégories de problèmes
export const CATEGORIES = [
  { key: 'route',       label: 'Route / Voirie',     icon: '🛣️',  color: '#795548' },
  { key: 'lampadaire',  label: 'Lampadaire',          icon: '💡',  color: '#FFC107' },
  { key: 'eau',         label: 'Eau / SODECI',        icon: '💧',  color: '#2196F3' },
  { key: 'electricite', label: 'Électricité / CIE',  icon: '⚡',  color: '#FF9800' },
  { key: 'dechets',     label: 'Déchets / Propreté', icon: '🗑️',  color: '#4CAF50' },
  { key: 'securite',    label: 'Sécurité / Police',  icon: '🚔',  color: '#F44336' },
  { key: 'sante',       label: 'Santé',               icon: '🏥',  color: '#E91E63' },
  { key: 'transport',   label: 'Transport',           icon: '🚌',  color: '#9C27B0' },
  { key: 'autre',       label: 'Autre',               icon: '📋',  color: '#607D8B' },
];

// Labels des statuts
export const STATUS_LABELS: Record<string, string> = {
  received:    'Reçu',
  in_progress: 'En cours',
  resolved:    'Résolu',
  rejected:    'Refusé',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low:    'Faible',
  medium: 'Normal',
  high:   'Urgent',
  urgent: 'Très urgent',
};
