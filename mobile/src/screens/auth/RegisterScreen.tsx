import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator, FlatList
} from 'react-native';
import { authApi, communesApi } from '../../services/api';
import { COLORS } from '../../constants';
import { Commune } from '../../types';

export default function RegisterScreen({ navigation }: any) {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [communeSearch, setCommuneSearch] = useState('');
  const [communeResults, setCommuneResults] = useState<Commune[]>([]);
  const [selectedCommune, setSelectedCommune] = useState<Commune | null>(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const searchCommune = async (text: string) => {
    setCommuneSearch(text);
    setSelectedCommune(null);
    if (text.length < 2) { setCommuneResults([]); return; }
    try {
      const res = await communesApi.search(text);
      setCommuneResults(res.data);
    } catch {}
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !phone || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    setLoading(true);
    try {
      await authApi.register({
        first_name: firstName,
        last_name: lastName,
        phone,
        password,
        commune_id: selectedCommune?.id
      });
      setStep('otp');
      Alert.alert('✅ Compte créé', 'Un code OTP a été envoyé à votre téléphone');
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Erreur', 'Le code OTP doit avoir 6 chiffres');
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyOtp(phone, otp);
      Alert.alert('✅ Téléphone vérifié', 'Vous pouvez maintenant vous connecter', [
        { text: 'Se connecter', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Code OTP invalide');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Vérification</Text>
        <Text style={styles.subtitle}>Entrez le code à 6 chiffres envoyé au {phone}</Text>
        <TextInput
          style={[styles.input, { textAlign: 'center', fontSize: 28, letterSpacing: 8 }]}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />
        <TouchableOpacity style={styles.btn} onPress={handleVerifyOtp} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Vérifier</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => authApi.sendOtp(phone)} style={styles.linkBtn}>
          <Text style={styles.linkText}>Renvoyer le code</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>Rejoignez Arlette Ma Commune</Text>

      <Text style={styles.label}>Prénom *</Text>
      <TextInput style={styles.input} placeholder="Votre prénom" value={firstName} onChangeText={setFirstName} />

      <Text style={styles.label}>Nom *</Text>
      <TextInput style={styles.input} placeholder="Votre nom" value={lastName} onChangeText={setLastName} />

      <Text style={styles.label}>Téléphone *</Text>
      <TextInput style={styles.input} placeholder="0701234567" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

      <Text style={styles.label}>Mot de passe *</Text>
      <TextInput style={styles.input} placeholder="Minimum 6 caractères" secureTextEntry value={password} onChangeText={setPassword} />

      <Text style={styles.label}>Commune (optionnel)</Text>
      <TextInput
        style={styles.input}
        placeholder="Tapez les premières lettres..."
        value={selectedCommune ? selectedCommune.name : communeSearch}
        onChangeText={searchCommune}
      />
      {communeResults.length > 0 && !selectedCommune && (
        <View style={styles.dropdown}>
          {communeResults.map((c) => (
            <TouchableOpacity key={c.id} style={styles.dropdownItem}
              onPress={() => { setSelectedCommune(c); setCommuneResults([]); setCommuneSearch(c.name); }}>
              <Text style={styles.dropdownText}>🏘️ {c.name} — {c.city}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Créer mon compte</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkBtn}>
        <Text style={styles.linkText}>Déjà un compte ? <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Se connecter</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.white, padding: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary, marginTop: 40, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.gray, marginBottom: 28 },
  label: { fontSize: 14, color: COLORS.black, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: COLORS.lightGray, borderRadius: 10,
    padding: 14, fontSize: 16, color: COLORS.black, marginBottom: 16,
  },
  dropdown: {
    backgroundColor: COLORS.white, borderRadius: 10, marginTop: -12, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.lightGray, elevation: 4,
  },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  dropdownText: { fontSize: 15, color: COLORS.black },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  btnText: { color: COLORS.white, fontSize: 17, fontWeight: 'bold' },
  linkBtn: { alignItems: 'center', marginTop: 20 },
  linkText: { color: COLORS.gray, fontSize: 14 },
});
