import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator, Image, Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { reportsApi } from '../../services/api';
import { COLORS, CATEGORIES } from '../../constants';
import { useAuth } from '../../context/AuthContext';

type Step = 'category' | 'camera' | 'details' | 'sending';

export default function NewReportScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(route.params?.category ? 'camera' : 'category');
  const [selectedCategory, setSelectedCategory] = useState<string>(route.params?.category || '');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [quartier, setQuartier] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // ── Étape 1 : Choisir la catégorie ──
  if (step === 'category') {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Type de problème</Text>
          <View style={{ width: 60 }} />
        </View>
        <Text style={styles.stepLabel}>Étape 1/3 — Que se passe-t-il ?</Text>
        <ScrollView contentContainerStyle={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.catCard, { borderColor: cat.color }]}
              onPress={() => { setSelectedCategory(cat.key); setStep('camera'); }}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={[styles.catLabel, { color: cat.color }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ── Étape 2 : Caméra (photo en direct) ──
  if (step === 'camera') {
    if (!cameraPermission?.granted) {
      return (
        <View style={styles.permContainer}>
          <Text style={styles.permIcon}>📷</Text>
          <Text style={styles.permTitle}>Accès à la caméra requis</Text>
          <Text style={styles.permSub}>
            Arlette Ma Commune nécessite la caméra pour prendre une photo du problème en temps réel.
            {'\n\n'}⚠️ Les photos depuis la galerie ne sont pas acceptées.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={requestCameraPermission}>
            <Text style={styles.btnText}>Autoriser la caméra</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const takePicture = async () => {
      if (!cameraRef.current) return;
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
        if (photo) {
          setPhotoUri(photo.uri);
          setPhotoBase64(photo.base64 || null);

          // Récupérer la géolocalisation
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          }
          setStep('details');
        }
      } catch (err) {
        Alert.alert('Erreur', 'Impossible de prendre la photo');
      }
    };

    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <View style={styles.camTopBar}>
          <TouchableOpacity onPress={() => setStep('category')}>
            <Text style={styles.camBack}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.camTitle}>Prenez une photo du problème</Text>
        </View>
        <Text style={styles.camWarning}>⚠️ Photo en direct uniquement — galerie désactivée</Text>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          <View style={styles.camOverlay}>
            <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // ── Étape 3 : Détails + Envoi ──
  const handleSubmit = async () => {
    if (!quartier.trim()) {
      Alert.alert('Erreur', 'Veuillez indiquer le quartier ou la localisation précise');
      return;
    }
    if (!photoUri || !photoBase64) {
      Alert.alert('Erreur', 'Photo obligatoire');
      return;
    }
    if (!user?.commune?.id) {
      Alert.alert('Erreur', 'Veuillez d\'abord définir votre commune dans votre profil');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('commune_id', user.commune.id);
      formData.append('category', selectedCategory);
      formData.append('quartier', quartier);
      if (description) formData.append('description', description);
      if (location) {
        formData.append('latitude', String(location.latitude));
        formData.append('longitude', String(location.longitude));
      }
      formData.append('photo', {
        uri: photoUri,
        name: `report_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      const res = await reportsApi.create(formData);
      const { ticket } = res.data;

      Alert.alert(
        '✅ Signalement envoyé !',
        `Votre ticket ${ticket.ticket_number} a été créé. Vous recevrez des notifications sur l'avancement.`,
        [{ text: 'Voir mon ticket', onPress: () => navigation.replace('TicketDetail', { ticketId: ticket.id }) }]
      );
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  const catInfo = CATEGORIES.find(c => c.key === selectedCategory);

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setStep('camera')}>
          <Text style={styles.backBtn}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Détails du problème</Text>
        <View style={{ width: 60 }} />
      </View>

      <Text style={styles.stepLabel}>Étape 3/3 — Précisez le problème</Text>

      {/* Photo preview */}
      {photoUri && (
        <View style={styles.photoPreview}>
          <Image source={{ uri: photoUri }} style={styles.photoImg} />
          <View style={styles.photoOverlay}>
            <Text style={styles.photoCheck}>📸 Photo prise en direct</Text>
            {location && <Text style={styles.photoGps}>📍 GPS récupéré</Text>}
          </View>
          <TouchableOpacity style={styles.retakeBtn} onPress={() => setStep('camera')}>
            <Text style={styles.retakeText}>Reprendre</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Catégorie sélectionnée */}
      <View style={[styles.catSelected, { backgroundColor: catInfo?.color + '22', borderColor: catInfo?.color }]}>
        <Text style={styles.catSelectedIcon}>{catInfo?.icon}</Text>
        <Text style={[styles.catSelectedLabel, { color: catInfo?.color }]}>{catInfo?.label}</Text>
        <TouchableOpacity onPress={() => setStep('category')}>
          <Text style={styles.changeBtn}>Changer</Text>
        </TouchableOpacity>
      </View>

      {/* Quartier */}
      <Text style={styles.label}>Quartier / Lieu précis *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Quartier Anador, près de la pharmacie..."
        value={quartier}
        onChangeText={setQuartier}
        multiline
      />

      {/* Description */}
      <Text style={styles.label}>Description (optionnel)</Text>
      <TextInput
        style={[styles.input, { minHeight: 80 }]}
        placeholder="Décrivez le problème en détail..."
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
      />

      {/* Bouton envoi */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <>
              <Text style={styles.submitIcon}>🚀</Text>
              <Text style={styles.submitText}>Envoyer le signalement</Text>
            </>
        }
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, padding: 16, paddingTop: 50,
  },
  topTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  backBtn: { color: COLORS.white, fontSize: 15, width: 60 },
  stepLabel: { textAlign: 'center', color: COLORS.gray, fontSize: 13, marginVertical: 12 },
  categoriesGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 8
  },
  catCard: {
    width: '42%', margin: '4%', alignItems: 'center', padding: 16,
    backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 2, elevation: 2,
  },
  catIcon: { fontSize: 36, marginBottom: 8 },
  catLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  permContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 30 },
  permIcon: { fontSize: 64, marginBottom: 20 },
  permTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  permSub: { fontSize: 14, color: '#ccc', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', width: '100%' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  camTopBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: 16, paddingTop: 50, backgroundColor: 'rgba(0,0,0,0.5)' },
  camBack: { color: '#fff', fontSize: 15 },
  camTitle: { color: '#fff', fontSize: 14, marginTop: 4 },
  camWarning: { position: 'absolute', top: 110, left: 0, right: 0, zIndex: 10, textAlign: 'center', color: '#ffcc00', fontSize: 12, backgroundColor: 'rgba(0,0,0,0.6)', padding: 6 },
  camOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40 },
  captureBtn: {
    width: 70, height: 70, borderRadius: 35, borderWidth: 4,
    borderColor: '#fff', justifyContent: 'center', alignItems: 'center',
  },
  captureInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#fff' },
  photoPreview: { margin: 16, borderRadius: 14, overflow: 'hidden', position: 'relative' },
  photoImg: { width: '100%', height: 200 },
  photoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, flexDirection: 'row', justifyContent: 'space-around' },
  photoCheck: { color: '#fff', fontSize: 12 },
  photoGps: { color: '#4fc3f7', fontSize: 12 },
  retakeBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  retakeText: { color: '#fff', fontSize: 13 },
  catSelected: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16,
    padding: 12, borderRadius: 12, borderWidth: 2,
  },
  catSelectedIcon: { fontSize: 24, marginRight: 10 },
  catSelectedLabel: { flex: 1, fontWeight: 'bold', fontSize: 15 },
  changeBtn: { color: COLORS.gray, fontSize: 13 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.black, marginHorizontal: 16, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.white, borderRadius: 10, padding: 14,
    fontSize: 15, color: COLORS.black, marginHorizontal: 16, marginBottom: 16, elevation: 1,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.secondary, margin: 16, borderRadius: 14, padding: 18, elevation: 3,
  },
  submitIcon: { fontSize: 20, marginRight: 8 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
