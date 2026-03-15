import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { authApi, communesApi } from '../../services/api';
import { COLORS } from '../../constants';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [communeSearch, setCommuneSearch] = useState(user?.commune?.name || '');
  const [communeResults, setCommuneResults] = useState<any[]>([]);
  const [selectedCommune, setSelectedCommune] = useState<any>(user?.commune || null);
  const [saving, setSaving] = useState(false);

  const handleCommuneSearch = async (q: string) => {
    setCommuneSearch(q);
    if (q.length < 2) { setCommuneResults([]); return; }
    try {
      const res = await communesApi.search(q);
      setCommuneResults(res.data);
    } catch {}
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: email || undefined,
        commune_id: selectedCommune?.id,
      });
      await refreshUser();
      setEditing(false);
      Alert.alert('✅ Succès', 'Profil mis à jour');
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Oui', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')}
          </Text>
        </View>
        <Text style={styles.name}>{user?.first_name} {user?.last_name}</Text>
        <Text style={styles.phone}>📱 {user?.phone}</Text>
        <View style={styles.communeBadge}>
          <Text style={styles.communeText}>📍 {user?.commune?.name || 'Commune non définie'}</Text>
        </View>
      </View>

      {/* Infos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes informations</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.editBtn}>✏️ Modifier</Text>
            </TouchableOpacity>
          )}
        </View>

        {editing ? (
          <View>
            <Text style={styles.label}>Prénom</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

            <Text style={styles.label}>Nom</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

            <Text style={styles.label}>Email (optionnel)</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

            <Text style={styles.label}>Commune</Text>
            <TextInput
              style={styles.input}
              value={communeSearch}
              onChangeText={handleCommuneSearch}
              placeholder="Rechercher votre commune..."
            />
            {communeResults.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.communeItem}
                onPress={() => {
                  setSelectedCommune(c);
                  setCommuneSearch(c.name);
                  setCommuneResults([]);
                }}
              >
                <Text style={styles.communeItemText}>📍 {c.name} — {c.region}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>Enregistrer</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <InfoRow label="Prénom" value={user?.first_name || '-'} />
            <InfoRow label="Nom" value={user?.last_name || '-'} />
            <InfoRow label="Téléphone" value={user?.phone || '-'} />
            <InfoRow label="Email" value={user?.email || 'Non renseigné'} />
            <InfoRow label="Commune" value={user?.commune?.name || 'Non définie'} />
            <InfoRow label="Compte vérifié" value={user?.is_verified ? '✅ Oui' : '❌ Non'} />
          </View>
        )}
      </View>

      {/* Déconnexion */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Se déconnecter</Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary, alignItems: 'center',
    paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.white + '33',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    borderWidth: 3, borderColor: COLORS.white,
  },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  name: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  phone: { fontSize: 14, color: COLORS.white + 'CC', marginTop: 4 },
  communeBadge: {
    marginTop: 10, backgroundColor: COLORS.white + '22',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  communeText: { color: COLORS.white, fontSize: 13 },
  section: {
    backgroundColor: COLORS.white, margin: 16, borderRadius: 16,
    padding: 16, elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.black },
  editBtn: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray,
  },
  infoLabel: { fontSize: 14, color: COLORS.gray },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.black },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.black, marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: COLORS.lightGray, borderRadius: 10,
    padding: 12, fontSize: 15, color: COLORS.black, marginBottom: 4,
  },
  communeItem: {
    backgroundColor: COLORS.lightGray, padding: 12, borderRadius: 8, marginBottom: 4,
  },
  communeItemText: { fontSize: 14, color: COLORS.black },
  editActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.gray, alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.gray, fontWeight: '600' },
  saveBtn: {
    flex: 1, padding: 14, borderRadius: 10,
    backgroundColor: COLORS.primary, alignItems: 'center',
  },
  saveBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  logoutBtn: {
    margin: 16, padding: 16, borderRadius: 12,
    backgroundColor: COLORS.error + '15', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.error + '40',
  },
  logoutText: { color: COLORS.error, fontWeight: 'bold', fontSize: 16 },
});
