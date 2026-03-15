import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { ticketsApi } from '../../services/api';
import { Ticket, TicketMessage } from '../../types';
import { COLORS, STATUS_LABELS, CATEGORIES } from '../../constants';
import { useAuth } from '../../context/AuthContext';

export default function TicketDetailScreen({ route, navigation }: any) {
  const { ticketId } = route.params;
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    try {
      const [tRes, mRes] = await Promise.all([
        ticketsApi.getById(ticketId),
        ticketsApi.getMessages(ticketId)
      ]);
      setTicket(tRes.data);
      setMessages(mRes.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      received: COLORS.warning, in_progress: COLORS.info,
      resolved: COLORS.success, rejected: COLORS.error,
    };
    return map[status] || COLORS.gray;
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await ticketsApi.sendMessage(ticketId, message);
      setMessage('');
      load();
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    } finally { setSending(false); }
  };

  if (loading || !ticket) {
    return <ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} size="large" />;
  }

  const cat = CATEGORIES.find(c => c.key === ticket.report?.category);
  const statusColor = getStatusColor(ticket.status);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{ticket.ticket_number}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container}>
        {/* Statut actuel */}
        <View style={[styles.statusBanner, { backgroundColor: statusColor }]}>
          <Text style={styles.statusEmoji}>
            {{ received: '🟡', in_progress: '🔵', resolved: '🟢', rejected: '🔴' }[ticket.status] || '⚪'}
          </Text>
          <View>
            <Text style={styles.statusLabel}>{STATUS_LABELS[ticket.status] || ticket.status}</Text>
            <Text style={styles.statusSub}>
              {ticket.status === 'resolved' ? `Résolu le ${new Date(ticket.resolved_at!).toLocaleDateString('fr-FR')}` :
               ticket.status === 'in_progress' ? 'Les agents travaillent sur votre signalement' :
               ticket.status === 'rejected' ? 'Votre signalement a été refusé' :
               'Votre signalement a été reçu par la structure'}
            </Text>
          </View>
        </View>

        {/* Détails du signalement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails du signalement</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>{cat?.icon}</Text>
            <View>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{cat?.label || ticket.report?.category}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <View>
              <Text style={styles.detailLabel}>Lieu</Text>
              <Text style={styles.detailValue}>{ticket.report?.quartier}</Text>
              {ticket.report?.commune && (
                <Text style={styles.detailSub}>{ticket.report.commune.name}</Text>
              )}
            </View>
          </View>
          {ticket.report?.description && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📝</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>{ticket.report.description}</Text>
              </View>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🏢</Text>
            <View>
              <Text style={styles.detailLabel}>Structure</Text>
              <Text style={styles.detailValue}>{ticket.report?.structure?.name || 'Non assignée'}</Text>
            </View>
          </View>
        </View>

        {/* Photo */}
        {ticket.report?.photo_url && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photo</Text>
            <Image source={{ uri: ticket.report.photo_url }} style={styles.photo} />
          </View>
        )}

        {/* Historique des statuts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique</Text>
          {(ticket.status_history || []).map((h, i) => (
            <View key={i} style={styles.historyRow}>
              <View style={[styles.historyDot, { backgroundColor: getStatusColor(h.status) }]} />
              <View style={styles.historyContent}>
                <Text style={styles.historyStatus}>{STATUS_LABELS[h.status] || h.status}</Text>
                {h.note ? <Text style={styles.historyNote}>{h.note}</Text> : null}
                <Text style={styles.historyDate}>{new Date(h.date).toLocaleString('fr-FR')}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Messages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Messages ({messages.length})</Text>
          {messages.length === 0 ? (
            <Text style={styles.noMsg}>Aucun message pour l'instant</Text>
          ) : (
            messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.msgBubble,
                  msg.sender_type === 'citizen' ? styles.msgRight : styles.msgLeft
                ]}
              >
                <Text style={[
                  styles.msgSender,
                  msg.sender_type === 'citizen' ? { textAlign: 'right' } : {}
                ]}>
                  {msg.sender_type === 'citizen' ? 'Vous' : '🏢 Agent'}
                </Text>
                <Text style={styles.msgText}>{msg.message}</Text>
                <Text style={styles.msgDate}>{new Date(msg.created_at).toLocaleString('fr-FR')}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Champ message */}
      <View style={styles.msgInput}>
        <TextInput
          style={styles.msgField}
          placeholder="Envoyer un message..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={sending}>
          {sending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.sendText}>→</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, padding: 16, paddingTop: 50,
  },
  back: { color: COLORS.white, fontSize: 22, width: 40 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  statusEmoji: { fontSize: 32 },
  statusLabel: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  statusSub: { fontSize: 12, color: COLORS.white + 'CC', marginTop: 2 },
  section: { backgroundColor: COLORS.white, margin: 12, marginBottom: 0, borderRadius: 14, padding: 16, elevation: 1 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.black, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  detailIcon: { fontSize: 22, width: 30 },
  detailLabel: { fontSize: 12, color: COLORS.gray },
  detailValue: { fontSize: 14, color: COLORS.black, fontWeight: '500' },
  detailSub: { fontSize: 12, color: COLORS.gray },
  photo: { width: '100%', height: 200, borderRadius: 10 },
  historyRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  historyDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, marginRight: 12 },
  historyContent: { flex: 1 },
  historyStatus: { fontSize: 14, fontWeight: '600', color: COLORS.black },
  historyNote: { fontSize: 13, color: COLORS.gray, marginTop: 2 },
  historyDate: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  noMsg: { color: COLORS.gray, fontSize: 14, textAlign: 'center', paddingVertical: 12 },
  msgBubble: { maxWidth: '80%', marginBottom: 12, padding: 10, borderRadius: 12 },
  msgRight: { alignSelf: 'flex-end', backgroundColor: COLORS.primary + '22' },
  msgLeft: { alignSelf: 'flex-start', backgroundColor: COLORS.lightGray },
  msgSender: { fontSize: 11, color: COLORS.gray, marginBottom: 4 },
  msgText: { fontSize: 14, color: COLORS.black },
  msgDate: { fontSize: 10, color: COLORS.gray, marginTop: 4 },
  msgInput: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    padding: 10, borderTopWidth: 1, borderTopColor: COLORS.lightGray,
  },
  msgField: { flex: 1, backgroundColor: COLORS.lightGray, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14, maxHeight: 80 },
  sendBtn: { backgroundColor: COLORS.primary, width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
