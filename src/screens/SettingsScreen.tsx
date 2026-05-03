import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Linking } from 'react-native';
import { useWallet } from '../contexts/WalletContext';
import { useGame } from '../contexts/GameContext';

const HERO_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663472861536/XieYK2a8rpN3wLQcLrDc5d/hero-logo-official_808c9ab8.png";

export default function SettingsScreen() {
  const { address, lockWallet, activeChain } = useWallet();
  const { xp, rank, streak } = useGame();

  function openLink(url: string) {
    Linking.openURL(url).catch(() => {});
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image source={{ uri: HERO_LOGO }} style={styles.profileAvatar} />
        <Text style={styles.profileRank}>{rank.badge} {rank.title}</Text>
        {address && (
          <Text style={styles.profileAddress}>{address.slice(0, 10)}...{address.slice(-8)}</Text>
        )}
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>{xp}</Text>
            <Text style={styles.profileStatLabel}>XP</Text>
          </View>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>{streak}</Text>
            <Text style={styles.profileStatLabel}>Streak</Text>
          </View>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>{activeChain === 'base' ? 'Base' : 'PLS'}</Text>
            <Text style={styles.profileStatLabel}>Chain</Text>
          </View>
        </View>
      </View>

      {/* Settings Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('Backup', 'View your seed phrase to back up your wallet')}>
          <Text style={styles.settingIcon}>🔑</Text>
          <Text style={styles.settingText}>Backup Seed Phrase</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('Password', 'Change your wallet password')}>
          <Text style={styles.settingIcon}>🔐</Text>
          <Text style={styles.settingText}>Change Password</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow} onPress={() => {
          lockWallet();
          Alert.alert('Locked', 'Wallet locked successfully');
        }}>
          <Text style={styles.settingIcon}>🔒</Text>
          <Text style={styles.settingText}>Lock Wallet</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network</Text>
        <TouchableOpacity style={styles.settingRow}>
          <Text style={styles.settingIcon}>🌐</Text>
          <Text style={styles.settingText}>Default Network</Text>
          <Text style={styles.settingValue}>{activeChain === 'base' ? 'Base' : 'PulseChain'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow}>
          <Text style={styles.settingIcon}>⛽</Text>
          <Text style={styles.settingText}>Gasless Mode</Text>
          <Text style={styles.settingValue}>Enabled</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow}>
          <Text style={styles.settingIcon}>📊</Text>
          <Text style={styles.settingText}>Slippage Tolerance</Text>
          <Text style={styles.settingValue}>0.5%</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About HERO</Text>
        <TouchableOpacity style={styles.settingRow} onPress={() => openLink('https://herobase.io')}>
          <Text style={styles.settingIcon}>🌍</Text>
          <Text style={styles.settingText}>herobase.io</Text>
          <Text style={styles.settingArrow}>↗</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow} onPress={() => openLink('https://vicfoundation.com')}>
          <Text style={styles.settingIcon}>🏛️</Text>
          <Text style={styles.settingText}>VIC Foundation</Text>
          <Text style={styles.settingArrow}>↗</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow} onPress={() => openLink('https://wallet.herobase.io/tokenomics')}>
          <Text style={styles.settingIcon}>📄</Text>
          <Text style={styles.settingText}>Whitepaper</Text>
          <Text style={styles.settingArrow}>↗</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow} onPress={() => openLink('https://t.me/HEROonPulseChain')}>
          <Text style={styles.settingIcon}>💬</Text>
          <Text style={styles.settingText}>Telegram Community</Text>
          <Text style={styles.settingArrow}>↗</Text>
        </TouchableOpacity>
      </View>

      {/* Version Info */}
      <View style={styles.versionSection}>
        <Text style={styles.versionText}>HERO Wallet v1.0.0</Text>
        <Text style={styles.versionSub}>Built by Veterans, for Veterans</Text>
        <Text style={styles.versionSub}>VIC Foundation 501(c)(3)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  profileHeader: { alignItems: 'center', paddingTop: 60, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#1a2332' },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, marginBottom: 12, borderWidth: 2, borderColor: '#c8a55a' },
  profileRank: { color: '#c8a55a', fontSize: 18, fontWeight: 'bold' },
  profileAddress: { color: '#888', fontSize: 12, marginTop: 4, fontFamily: 'monospace' },
  profileStats: { flexDirection: 'row', marginTop: 16, gap: 24 },
  profileStat: { alignItems: 'center' },
  profileStatValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  profileStatLabel: { color: '#888', fontSize: 11, marginTop: 2 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { color: '#c8a55a', fontSize: 14, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  settingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a2332', borderRadius: 12, padding: 14, marginBottom: 6 },
  settingIcon: { fontSize: 18, marginRight: 12 },
  settingText: { color: '#e0e0e0', fontSize: 15, flex: 1 },
  settingArrow: { color: '#888', fontSize: 16 },
  settingValue: { color: '#c8a55a', fontSize: 13 },
  versionSection: { alignItems: 'center', paddingVertical: 40 },
  versionText: { color: '#555', fontSize: 13 },
  versionSub: { color: '#444', fontSize: 11, marginTop: 4 },
});
