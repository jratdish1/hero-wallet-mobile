import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGame } from '../contexts/GameContext';

const ALL_RANKS = [
  { level: 1, title: 'Recruit', minXP: 0, badge: '🪖', perks: 'Basic wallet access' },
  { level: 2, title: 'Private', minXP: 100, badge: '⭐', perks: 'Swap fee discount 2%' },
  { level: 3, title: 'Corporal', minXP: 300, badge: '⭐⭐', perks: 'Priority swap routing' },
  { level: 4, title: 'Sergeant', minXP: 600, badge: '🎖️', perks: 'Gasless mode unlock' },
  { level: 5, title: 'Staff Sergeant', minXP: 1000, badge: '🎖️⭐', perks: 'Advanced analytics' },
  { level: 6, title: 'Gunnery Sergeant', minXP: 1500, badge: '🎖️🎖️', perks: 'Limit orders unlock' },
  { level: 7, title: 'Master Sergeant', minXP: 2500, badge: '🏅', perks: 'DCA automation' },
  { level: 8, title: 'First Sergeant', minXP: 4000, badge: '🏅⭐', perks: 'Exclusive NFT drop' },
  { level: 9, title: 'Sergeant Major', minXP: 6000, badge: '🏅🏅', perks: 'DAO voting power 2x' },
  { level: 10, title: 'General', minXP: 10000, badge: '🫡', perks: 'All features + governance' },
];

export default function RankScreen() {
  const { xp, rank, streak } = useGame();

  return (
    <ScrollView style={styles.container}>
      {/* Current Rank Display */}
      <View style={styles.currentRank}>
        <Text style={styles.currentBadge}>{rank.badge}</Text>
        <Text style={styles.currentTitle}>{rank.title}</Text>
        <Text style={styles.currentXP}>{xp} XP earned</Text>
        <View style={styles.streakDisplay}>
          <Text style={styles.streakFire}>🔥</Text>
          <Text style={styles.streakNum}>{streak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
      </View>

      {/* Rank Progression */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎖️ Rank Progression</Text>
        <Text style={styles.sectionSub}>Military-inspired ranks based on your HERO journey</Text>
        
        {ALL_RANKS.map((r, i) => {
          const isCurrentRank = r.level === rank.level;
          const isUnlocked = xp >= r.minXP;
          const nextRank = ALL_RANKS[i + 1];
          const progressInRank = nextRank 
            ? Math.min(((xp - r.minXP) / (nextRank.minXP - r.minXP)) * 100, 100)
            : 100;

          return (
            <View key={r.level} style={[
              styles.rankRow,
              isCurrentRank && styles.rankRowCurrent,
              !isUnlocked && styles.rankRowLocked,
            ]}>
              <View style={styles.rankLeft}>
                <Text style={[styles.rankBadgeText, !isUnlocked && styles.rankLocked]}>
                  {isUnlocked ? r.badge : '🔒'}
                </Text>
                <View style={styles.rankInfo}>
                  <Text style={[styles.rankName, isCurrentRank && styles.rankNameCurrent]}>
                    {r.title}
                  </Text>
                  <Text style={styles.rankXP}>{r.minXP} XP required</Text>
                  <Text style={styles.rankPerk}>{r.perks}</Text>
                </View>
              </View>
              {isCurrentRank && (
                <View style={styles.currentTag}>
                  <Text style={styles.currentTagText}>YOU</Text>
                </View>
              )}
              {isUnlocked && !isCurrentRank && (
                <Text style={styles.unlockedCheck}>✅</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* How to Rank Up */}
      <View style={styles.howTo}>
        <Text style={styles.howToTitle}>⚡ How to Rank Up</Text>
        <View style={styles.howToItem}>
          <Text style={styles.howToIcon}>📱</Text>
          <Text style={styles.howToText}>Daily check-in: +10 XP</Text>
        </View>
        <View style={styles.howToItem}>
          <Text style={styles.howToIcon}>⇄</Text>
          <Text style={styles.howToText}>Each swap: +25 XP</Text>
        </View>
        <View style={styles.howToItem}>
          <Text style={styles.howToIcon}>🔥</Text>
          <Text style={styles.howToText}>Buy & Burn contribution: +150 XP</Text>
        </View>
        <View style={styles.howToItem}>
          <Text style={styles.howToIcon}>💎</Text>
          <Text style={styles.howToText}>Stake HERO: +75 XP/week</Text>
        </View>
        <View style={styles.howToItem}>
          <Text style={styles.howToIcon}>🔥</Text>
          <Text style={styles.howToText}>7-day streak: +100 XP bonus</Text>
        </View>
        <View style={styles.howToItem}>
          <Text style={styles.howToIcon}>💪</Text>
          <Text style={styles.howToText}>30-day streak: +500 XP bonus</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  currentRank: { alignItems: 'center', paddingTop: 60, paddingBottom: 30, backgroundColor: '#0d1117' },
  currentBadge: { fontSize: 64 },
  currentTitle: { color: '#c8a55a', fontSize: 28, fontWeight: 'bold', marginTop: 12 },
  currentXP: { color: '#888', fontSize: 16, marginTop: 6 },
  streakDisplay: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 4 },
  streakFire: { fontSize: 20 },
  streakNum: { color: '#ff6b35', fontSize: 20, fontWeight: 'bold' },
  streakLabel: { color: '#888', fontSize: 14, marginLeft: 4 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  sectionSub: { color: '#888', fontSize: 13, marginTop: 4, marginBottom: 16 },
  rankRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1a2332', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2a3442' },
  rankRowCurrent: { borderColor: '#c8a55a', backgroundColor: '#1a2a1a' },
  rankRowLocked: { opacity: 0.5 },
  rankLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rankBadgeText: { fontSize: 24, marginRight: 12 },
  rankLocked: { opacity: 0.4 },
  rankInfo: { flex: 1 },
  rankName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  rankNameCurrent: { color: '#c8a55a' },
  rankXP: { color: '#666', fontSize: 11, marginTop: 2 },
  rankPerk: { color: '#4ade80', fontSize: 11, marginTop: 2 },
  currentTag: { backgroundColor: '#c8a55a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  currentTagText: { color: '#0d1117', fontSize: 11, fontWeight: 'bold' },
  unlockedCheck: { fontSize: 16 },
  howTo: { margin: 16, padding: 16, backgroundColor: '#1a2332', borderRadius: 12, marginBottom: 40 },
  howToTitle: { color: '#c8a55a', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  howToItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  howToIcon: { fontSize: 18 },
  howToText: { color: '#e0e0e0', fontSize: 14 },
});
