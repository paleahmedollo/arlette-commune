import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator, Image
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      await login(phone, password);
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Logo / Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>🏙️</Text>
        <Text style={styles.appName}>Arlette Ma Commune</Text>
        <Text style={styles.tagline}>Signalez, suivez, améliorez votre commune</Text>
      </View>

      {/* Formulaire */}
      <View style={styles.form}>
        <Text style={styles.label}>Numéro de téléphone</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 0701234567"
          placeholderTextColor={COLORS.gray}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Mot de passe</Text>
        <View style={styles.pwdContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Mot de passe"
            placeholderTextColor={COLORS.gray}
            secureTextEntry={!showPwd}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
            <Text>{showPwd ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btnLogin, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Se connecter</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkBtn}>
          <Text style={styles.linkText}>Pas encore de compte ? <Text style={styles.linkHighlight}>S'inscrire</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.white, padding: 24 },
  header: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  emoji: { fontSize: 64, marginBottom: 12 },
  appName: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
  tagline: { fontSize: 14, color: COLORS.gray, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  form: { flex: 1 },
  label: { fontSize: 14, color: COLORS.black, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 16,
  },
  pwdContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  eyeBtn: { padding: 14, marginLeft: 8 },
  btnLogin: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: COLORS.white, fontSize: 17, fontWeight: 'bold' },
  linkBtn: { alignItems: 'center', marginTop: 20 },
  linkText: { color: COLORS.gray, fontSize: 14 },
  linkHighlight: { color: COLORS.primary, fontWeight: 'bold' },
});
