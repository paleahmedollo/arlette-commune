import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ScrollView, RefreshControl, ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { ticketsApi } from '../../services/api';
import { Ticket } from '../../types';
import { COLORS, STATUS_LABELS, CATEGORIES } from '../../constants';

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTickets = async () => {
    try {
      const res = await ticketsApi.myTickets();
      setTickets(res.data.slice(0, 5)); // 5 derniers
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadTickets(); }, []);

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      received: COLORS.warning,
      in_progress: COLORS.info,
      resolved: COLORS.success,
      rejected: COLORS.error,
    };
    return map[status] || COLORS.gray;
  };

  const getCategoryIcon = (category: string) => {
    return CATEGORIES.find(c => c.key === category)?.icon || '📋';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTickets(); }} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {user?.first_name} 👋</Text>
          <Text style={styles.commune}>{user?.commune?.name || 'Ma Commune'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.notifIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Bouton principal : Signaler */}
      <TouchableOpacity
        style={styles.reportBtn}
        onPress={() => navigation.navigate('NewReport')}
        activeOpacity={0.85}
      >
        <Text style={styles.reportBtnIcon}>⚠️</Text>
        <Text style={styles.reportBtnText}>Signaler un problème</Text>
        <Text style={styles.reportBtnSub}>Photo • Localisation • Suivi en temps réel</Text>
      </TouchableOpacity>

      {/* Catégories rapides */}
      <Text style={styles.sectionTitle}>Catégories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryChip, { backgroundColor: cat.color + '22', borderColor: cat.color }]}
            onPress={() => navigation.navigate('NewReport', { category: cat.key })}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label.split('/')[0]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Mes derniers tickets */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mes signalements</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MyTickets')}>
          <Text style={styles.seeAll}>Voir tout →</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : tickets.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Aucun signalement pour l'instant</Text>
          <Text style={styles.emptySubText}>Signalez un problème dans votre commune</Text>
        </View>
      ) : (
        tickets.map((ticket) => (
          <TouchableOpacity
            key={ticket.id}
            style={styles.ticketCard}
            onPress={() => navigation.navigate('TicketDetail', { ticketId: ticket.id })}
          >
            <View style={styles.ticketLeft}>
              <Text style={styles.ticketIcon}>{getCategoryIcon(ticket.report?.category || '')}</Text>
            </View>
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketNumber}>{ticket.ticket_number}</Text>
              <Text style={styles.ticketCategory}>
                {CATEGORIES.find(c => c.key === ticket.report?.category)?.label || ticket.report?.category}
              </Text>
              <Text style={styles.ticketQuartier}>📍 {ticket.report?.quartier}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '22' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                {STATUS_LABELS[ticket.status] || ticket.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.primary, padding: 20, paddingTop: 50, paddingBottom: 24,
  },
  greeting: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  commune: { fontSize: 13, color: COLORS.primaryLight, marginTop: 2 },
  notifIcon: { fontSize: 26 },
  reportBtn: {
    margin: 16, backgroundColor: COLORS.secondary, borderRadius: 16,
    padding: 20, alignItems: 'center', elevation: 4,
  },
  reportBtnIcon: { fontSize: 40, marginBottom: 8 },
  reportBtnText: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  reportBtnSub: { fontSize: 12, color: COLORS.white + 'CC', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.black, marginHorizontal: 16, marginTop: 16, marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginRight: 16 },
  seeAll: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  categoriesRow: { paddingHorizontal: 12, marginBottom: 8 },
  categoryChip: {
    alignItems: 'center', padding: 10, marginHorizontal: 4,
    borderRadius: 12, borderWidth: 1, minWidth: 70,
  },
  categoryIcon: { fontSize: 24 },
  categoryLabel: { fontSize: 11, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.black },
  emptySubText: { fontSize: 13, color: COLORS.gray, marginTop: 6, textAlign: 'center' },
  ticketCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 14, elevation: 2,
  },
  ticketLeft: { width: 40, alignItems: 'center' },
  ticketIcon: { fontSize: 24 },
  ticketInfo: { flex: 1, marginLeft: 12 },
  ticketNumber: { fontSize: 13, fontWeight: 'bold', color: COLORS.primary },
  ticketCategory: { fontSize: 14, color: COLORS.black, marginTop: 2 },
  ticketQuartier: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
});
