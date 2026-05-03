import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useGame, Mission } from '../contexts/GameContext';

function MissionCard({ mission, onClaim }: { mission: Mission; onClaim: () => void }) {
  const progress = mission.target > 1 ? `${mission.progress}/${mission.target}` : '';
  const progressPct = (mission.progress / mission.target) * 100;

  return (
    <View style={[styles.missionCard, mission.completed && styles.missionCompleted]}>
      <View style={styles.missionLeft}>
        <Text style={styles.missionIcon}>{mission.icon}</Text>
      </View>
      <View style={styles.missionCenter}>
        <Text style={[styles.missionTitle, mission.completed && styles.missionTitleDone]}>
          {mission.title}
        </Text>
        <Text style={styles.missionDesc}>{mission.description}</Text>
        {mission.target > 1 && !mission.completed && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
        )}
        {progress ? <Text style={styles.progressText}>{progress}</Text> : null}
      </View>
      <View style={styles.missionRight}>
        {mission.completed ? (
          <Text style={styles.completedBadge}>✅</Text>
        ) : (
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>+{mission.xpReward} XP</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function MissionsScreen() {
  const { missions, xp, rank, streak, completeMission } = useGame();

  const dailyMissions = missions.filter(m => m.type === 'daily');
  const weeklyMissions = missions.filter(m => m.type === 'weekly');
  const achievements = missions.filter(m => m.type === 'achievement');

  const dailyCompleted = dailyMissions.filter(m => m.completed).length;
  const weeklyCompleted = weeklyMissions.filter(m => m.completed).length;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎯 Missions</Text>
        <Text style={styles.headerSub}>Complete missions to earn XP and rank up!</Text>
        
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{xp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{rank.badge}</Text>
            <Text style={styles.statLabel}>{rank.title}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>🔥 {streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>
      </View>

      {/* Daily Missions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📅 Daily Missions</Text>
          <Text style={styles.sectionCount}>{dailyCompleted}/{dailyMissions.length}</Text>
        </View>
        {dailyMissions.map(m => (
          <MissionCard key={m.id} mission={m} onClaim={() => completeMission(m.id)} />
        ))}
        {dailyCompleted === dailyMissions.length && (
          <View style={styles.allDoneBanner}>
            <Text style={styles.allDoneText}>🎉 All daily missions complete! Come back tomorrow.</Text>
          </View>
        )}
      </View>

      {/* Weekly Missions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📆 Weekly Missions</Text>
          <Text style={styles.sectionCount}>{weeklyCompleted}/{weeklyMissions.length}</Text>
        </View>
        {weeklyMissions.map(m => (
          <MissionCard key={m.id} mission={m} onClaim={() => completeMission(m.id)} />
        ))}
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏆 Achievements</Text>
          <Text style={styles.sectionCount}>{achievements.filter(a => a.completed).length}/{achievements.length}</Text>
        </View>
        {achievements.map(m => (
          <MissionCard key={m.id} mission={m} onClaim={() => completeMission(m.id)} />
        ))}
      </View>

      {/* Bonus XP Info */}
      <View style={styles.bonusInfo}>
        <Text style={styles.bonusTitle}>💡 Bonus XP Tips</Text>
        <Text style={styles.bonusText}>• Login streaks multiply XP: 7 days = 2x, 30 days = 5x</Text>
        <Text style={styles.bonusText}>• Staking HERO earns passive XP every day</Text>
        <Text style={styles.bonusText}>• Contributing to Buy & Burn gives bonus achievements</Text>
        <Text style={styles.bonusText}>• Refer friends for 50 XP each</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#0d1117' },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  headerSub: { color: '#888', fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: 'row', marginTop: 16, gap: 10 },
  statBox: { flex: 1, backgroundColor: '#1a2332', borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { color: '#c8a55a', fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 11, marginTop: 4 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  sectionCount: { color: '#c8a55a', fontSize: 14, fontWeight: '600' },
  missionCard: { flexDirection: 'row', backgroundColor: '#1a2332', borderRadius: 12, padding: 14, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: '#2a3442' },
  missionCompleted: { opacity: 0.6, borderColor: '#2a5a2a' },
  missionLeft: { marginRight: 12 },
  missionIcon: { fontSize: 24 },
  missionCenter: { flex: 1 },
  missionTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  missionTitleDone: { textDecorationLine: 'line-through', color: '#888' },
  missionDesc: { color: '#888', fontSize: 12, marginTop: 2 },
  progressBar: { height: 4, backgroundColor: '#2a3442', borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#c8a55a', borderRadius: 2 },
  progressText: { color: '#666', fontSize: 10, marginTop: 2 },
  missionRight: { marginLeft: 8 },
  completedBadge: { fontSize: 20 },
  xpBadge: { backgroundColor: 'rgba(200, 165, 90, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  xpBadgeText: { color: '#c8a55a', fontSize: 11, fontWeight: '600' },
  allDoneBanner: { backgroundColor: '#1a2a1a', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  allDoneText: { color: '#4ade80', fontSize: 14 },
  bonusInfo: { margin: 16, padding: 16, backgroundColor: '#1a2332', borderRadius: 12, marginBottom: 40 },
  bonusTitle: { color: '#c8a55a', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  bonusText: { color: '#888', fontSize: 13, marginBottom: 4 },
});
