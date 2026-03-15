import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { ticketsApi } from '../../services/api';
import { Ticket } from '../../types';
import { COLORS, STATUS_LABELS, CATEGORIES } from '../../constants';

export default function MyTicketsScreen({ navigation }: any) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await ticketsApi.myTickets();
      setTickets(res.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      received: COLORS.warning,
      in_progress: COLORS.info,
      resolved: COLORS.success,
      rejected: COLORS.error,
    };
    return map[status] || COLORS.gray;
  };

  const getStatusEmoji = (status: string) => {
    const map: Record<string, string> = {
      received: '🟡', in_progress: '🔵', resolved: '🟢', rejected: '🔴'
    };
    return map[status] || '⚪';
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} size="large" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mes signalements</Text>
        <Text style={styles.count}>{tickets.length}</Text>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Aucun signalement</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cat = CATEGORIES.find(c => c.key === item.report?.category);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.catIcon}>{cat?.icon || '📋'}</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.ticketNum}>{item.ticket_number}</Text>
                  <Text style={styles.catName}>{cat?.label || item.report?.category}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
                  <Text style={{ fontSize: 12 }}>{getStatusEmoji(item.status)}</Text>
                  <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
                    {STATUS_LABELS[item.status]}
                  </Text>
                </View>
              </View>
              <View style={styles.cardBot}>
                <Text style={styles.quartier}>📍 {item.report?.quartier}</Text>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('fr-FR')}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, padding: 16, paddingTop: 50,
  },
  back: { color: COLORS.white, fontSize: 22, width: 40 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  count: { color: COLORS.primaryLight, fontWeight: 'bold', fontSize: 16, width: 40, textAlign: 'right' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: COLORS.gray },
  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 12, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  catIcon: { fontSize: 28, marginRight: 12 },
  cardInfo: { flex: 1 },
  ticketNum: { fontSize: 13, fontWeight: 'bold', color: COLORS.primary },
  catName: { fontSize: 15, color: COLORS.black, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, gap: 4 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  cardBot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
  quartier: { fontSize: 13, color: COLORS.gray },
  date: { fontSize: 12, color: COLORS.gray },
});
