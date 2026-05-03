import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useWallet } from '../contexts/WalletContext';
import { useGame } from '../contexts/GameContext';
import { CHAIN_CONFIG } from '../config/tokens';

const HERO_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663472861536/XieYK2a8rpN3wLQcLrDc5d/hero-logo-official_808c9ab8.png";
const HERO_BANNER = "https://d2xsxph8kpxj0f.cloudfront.net/310519663472861536/XieYK2a8rpN3wLQcLrDc5d/HerobannerUN_342fe48e.jpg";
const API_BASE = 'https://wallet.herobase.io/api/trpc';

export default function WalletScreen() {
  const { address, activeChain, switchChain, createWallet, importWallet, balances } = useWallet();
  const { xp, rank, nextRank, xpToNextRank, streak } = useGame();
  const [prices, setPrices] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');

  const config = CHAIN_CONFIG[activeChain];

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchPrices() {
    try {
      const res = await fetch(`${API_BASE}/prices.ticker`);
      const data = await res.json();
      if (data?.result?.data) {
        setPrices(data.result.data);
      }
    } catch (e) {
      console.log('Price fetch error:', e);
    } finally {
      setLoading(false);
    }
  }

  // Landing screen - no wallet created yet
  if (!address) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.landingContent}>
        {/* Hero Banner */}
        <Image source={{ uri: HERO_BANNER }} style={styles.heroBanner} />
        <View style={styles.overlay} />
        
        {/* Logo & Title */}
        <View style={styles.logoSection}>
          <Image source={{ uri: HERO_LOGO }} style={styles.logo} />
          <Text style={styles.appTitle}>HERO WALLET</Text>
          <Text style={styles.appSubtitle}>Built for Veterans. Powered by DeFi.</Text>
          <Text style={styles.tagline}>PulseChain • Base • Multi-Chain</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.createBtn} onPress={() => {
            Alert.prompt ? Alert.prompt('Create Wallet', 'Set a password to encrypt your wallet:', (pwd) => {
              if (pwd && pwd.length >= 6) createWallet(pwd);
              else Alert.alert('Error', 'Password must be at least 6 characters');
            }) : createWallet('hero2024');
          }}>
            <Text style={styles.createBtnIcon}>🛡️</Text>
            <Text style={styles.createBtnText}>Create New Wallet</Text>
            <Text style={styles.createBtnSub}>Generate a fresh wallet with seed phrase</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.importBtn} onPress={() => {
            Alert.alert('Import Wallet', 'Enter your seed phrase or private key to import an existing wallet.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Import', onPress: () => importWallet('', 'hero2024') },
            ]);
          }}>
            <Text style={styles.importBtnIcon}>📥</Text>
            <Text style={styles.importBtnText}>Import Existing Wallet</Text>
            <Text style={styles.importBtnSub}>Seed phrase or private key</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.wcBtn} onPress={() => {
            Alert.alert('WalletConnect', 'Scan QR code to connect with MetaMask, Coinbase, or 300+ wallets');
          }}>
            <Text style={styles.wcBtnIcon}>🔗</Text>
            <Text style={styles.wcBtnText}>Connect via WalletConnect</Text>
          </TouchableOpacity>
        </View>

        {/* Security Badges */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🔐</Text>
            <Text style={styles.badgeText}>Non-Custodial</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🛡️</Text>
            <Text style={styles.badgeText}>Encrypted</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>✅</Text>
            <Text style={styles.badgeText}>Audited</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>VIC Foundation 501(c)(3) • Veteran Owned</Text>
      </ScrollView>
    );
  }

  // Main wallet view
  return (
    <ScrollView style={styles.container}>
      {/* XP & Rank Header */}
      <View style={styles.xpHeader}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankEmoji}>{rank.badge}</Text>
          <Text style={styles.rankTitle}>{rank.title}</Text>
        </View>
        <View style={styles.xpBarContainer}>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: nextRank ? `${((xp - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100}%` : '100%' }]} />
          </View>
          <Text style={styles.xpText}>{xp} XP {nextRank ? `• ${xpToNextRank} to ${nextRank.title}` : '• MAX RANK'}</Text>
        </View>
        {streak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {streak} day streak</Text>
          </View>
        )}
      </View>

      {/* Chain Selector */}
      <View style={styles.chainSelector}>
        <TouchableOpacity
          style={[styles.chainBtn, activeChain === 'base' && styles.chainBtnActive]}
          onPress={() => switchChain('base')}
        >
          <Text style={styles.chainEmoji}>🔵</Text>
          <Text style={[styles.chainText, activeChain === 'base' && styles.chainTextActive]}>Base</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chainBtn, activeChain === 'pulsechain' && styles.chainBtnActive]}
          onPress={() => switchChain('pulsechain')}
        >
          <Text style={styles.chainEmoji}>💜</Text>
          <Text style={[styles.chainText, activeChain === 'pulsechain' && styles.chainTextActive]}>PulseChain</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Image source={{ uri: HERO_LOGO }} style={styles.balanceLogo} />
          <Text style={styles.balanceLabel}>Total Balance ({config.name})</Text>
        </View>
        <Text style={styles.balanceAmount}>
          {parseFloat(balances[activeChain === "base" ? "ETH" : "PLS"] || "0").toFixed(6)} {config.nativeSymbol}
        </Text>
        <Text style={styles.addressText}>
          {address.slice(0, 8)}...{address.slice(-6)}
        </Text>
        
        {/* Live Prices */}
        {prices && (
          <View style={styles.priceRow}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>HERO</Text>
              <Text style={styles.priceValue}>${prices.hero?.toFixed(7) || '—'}</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>VETS</Text>
              <Text style={styles.priceValue}>${prices.vets?.toFixed(6) || '—'}</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>{activeChain === 'base' ? 'ETH' : 'PLS'}</Text>
              <Text style={styles.priceValue}>
                ${activeChain === 'base' ? prices.eth?.toFixed(2) : prices.pls?.toFixed(8) || '—'}
              </Text>
            </View>
          </View>
        )}
        {loading && <ActivityIndicator color="#c8a55a" style={{ marginTop: 8 }} />}
      </View>

      {/* Token List */}
      <View style={styles.tokenSection}>
        <Text style={styles.sectionTitle}>Your Tokens</Text>
        <View style={styles.tokenRow}>
          <View style={[styles.tokenIcon, { backgroundColor: '#c8a55a' }]}>
            <Text style={styles.tokenIconText}>{config.nativeSymbol[0]}</Text>
          </View>
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenName}>{config.nativeSymbol}</Text>
            <Text style={styles.tokenChain}>{config.name}</Text>
          </View>
          <Text style={styles.tokenBalance}>{parseFloat(balances[activeChain === "base" ? "ETH" : "PLS"] || "0").toFixed(4)}</Text>
        </View>
        <View style={styles.tokenRow}>
          <View style={[styles.tokenIcon, { backgroundColor: '#ff6b35' }]}>
            <Text style={styles.tokenIconText}>H</Text>
          </View>
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenName}>HERO</Text>
            <Text style={styles.tokenChain}>{config.name}</Text>
          </View>
          <Text style={styles.tokenBalance}>{balances["HERO"] || '0'}</Text>
        </View>
        {activeChain === 'pulsechain' && (
          <View style={styles.tokenRow}>
            <View style={[styles.tokenIcon, { backgroundColor: '#4a90d9' }]}>
              <Text style={styles.tokenIconText}>V</Text>
            </View>
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenName}>VETS</Text>
              <Text style={styles.tokenChain}>PulseChain</Text>
            </View>
            <Text style={styles.tokenBalance}>{balances["VETS"] || '0'}</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>↑</Text>
          <Text style={styles.actionText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>↓</Text>
          <Text style={styles.actionText}>Receive</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>⇄</Text>
          <Text style={styles.actionText}>Swap</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>🔥</Text>
          <Text style={styles.actionText}>Burn</Text>
        </TouchableOpacity>
      </View>

      {/* Buy & Burn Stats */}
      <View style={styles.burnCard}>
        <Text style={styles.burnTitle}>🔥 Buy & Burn</Text>
        <Text style={styles.burnStat}>1.30M HERO burned</Text>
        <Text style={styles.burnSub}>1.3% of total supply permanently removed</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  // Landing styles
  landingContent: { alignItems: 'center', paddingBottom: 40 },
  heroBanner: { width: '100%', height: 200, position: 'absolute', top: 0 },
  overlay: { width: '100%', height: 200, position: 'absolute', top: 0, backgroundColor: 'rgba(13,17,23,0.7)' },
  logoSection: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  logo: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  appTitle: { color: '#c8a55a', fontSize: 32, fontWeight: 'bold', letterSpacing: 2 },
  appSubtitle: { color: '#e0e0e0', fontSize: 16, marginTop: 8, textAlign: 'center' },
  tagline: { color: '#666', fontSize: 13, marginTop: 6 },
  ctaSection: { width: '100%', paddingHorizontal: 20, marginTop: 40 },
  createBtn: { backgroundColor: '#1a2332', borderWidth: 1, borderColor: '#c8a55a', borderRadius: 16, padding: 20, marginBottom: 12, alignItems: 'center' },
  createBtnIcon: { fontSize: 28, marginBottom: 8 },
  createBtnText: { color: '#c8a55a', fontSize: 18, fontWeight: 'bold' },
  createBtnSub: { color: '#888', fontSize: 12, marginTop: 4 },
  importBtn: { backgroundColor: '#1a2332', borderWidth: 1, borderColor: '#4a90d9', borderRadius: 16, padding: 20, marginBottom: 12, alignItems: 'center' },
  importBtnIcon: { fontSize: 28, marginBottom: 8 },
  importBtnText: { color: '#4a90d9', fontSize: 18, fontWeight: 'bold' },
  importBtnSub: { color: '#888', fontSize: 12, marginTop: 4 },
  wcBtn: { backgroundColor: '#1a2332', borderWidth: 1, borderColor: '#3396ff', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  wcBtnIcon: { fontSize: 20 },
  wcBtnText: { color: '#3396ff', fontSize: 16, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', gap: 16, marginTop: 30 },
  badge: { alignItems: 'center' },
  badgeIcon: { fontSize: 24 },
  badgeText: { color: '#888', fontSize: 11, marginTop: 4 },
  footer: { color: '#444', fontSize: 11, marginTop: 30 },
  // XP Header
  xpHeader: { padding: 16, paddingTop: 50, backgroundColor: '#0d1117' },
  rankBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rankEmoji: { fontSize: 24 },
  rankTitle: { color: '#c8a55a', fontSize: 16, fontWeight: 'bold' },
  xpBarContainer: { marginBottom: 4 },
  xpBarBg: { height: 8, backgroundColor: '#1a2332', borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: '#c8a55a', borderRadius: 4 },
  xpText: { color: '#888', fontSize: 11, marginTop: 4 },
  streakBadge: { backgroundColor: 'rgba(255, 107, 53, 0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginTop: 6 },
  streakText: { color: '#ff6b35', fontSize: 12, fontWeight: '600' },
  // Chain selector
  chainSelector: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 8 },
  chainBtn: { flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 12, backgroundColor: '#1a2332', alignItems: 'center', justifyContent: 'center', gap: 6 },
  chainBtnActive: { backgroundColor: '#c8a55a' },
  chainEmoji: { fontSize: 16 },
  chainText: { color: '#888', fontWeight: '600', fontSize: 14 },
  chainTextActive: { color: '#0d1117' },
  // Balance card
  balanceCard: { margin: 16, padding: 20, backgroundColor: '#1a2332', borderRadius: 16, borderWidth: 1, borderColor: '#2a3442' },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  balanceLogo: { width: 24, height: 24, borderRadius: 12 },
  balanceLabel: { color: '#888', fontSize: 13 },
  balanceAmount: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  addressText: { color: '#555', fontSize: 12, marginTop: 6, fontFamily: 'monospace' },
  priceRow: { flexDirection: 'row', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2a3442' },
  priceItem: { flex: 1, alignItems: 'center' },
  priceLabel: { color: '#888', fontSize: 11 },
  priceValue: { color: '#c8a55a', fontSize: 13, fontWeight: '600', marginTop: 2 },
  // Tokens
  tokenSection: { paddingHorizontal: 16 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  tokenRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a2332' },
  tokenIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tokenIconText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  tokenInfo: { flex: 1, marginLeft: 12 },
  tokenName: { color: '#fff', fontSize: 16, fontWeight: '500' },
  tokenChain: { color: '#666', fontSize: 12 },
  tokenBalance: { color: '#fff', fontSize: 16 },
  // Actions
  actionsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  actionBtn: { flex: 1, alignItems: 'center', padding: 14, backgroundColor: '#1a2332', borderRadius: 12, borderWidth: 1, borderColor: '#2a3442' },
  actionIcon: { fontSize: 22, marginBottom: 4 },
  actionText: { color: '#e0e0e0', fontSize: 11, fontWeight: '500' },
  // Burn card
  burnCard: { margin: 16, padding: 16, backgroundColor: '#1a1a0d', borderRadius: 12, borderWidth: 1, borderColor: '#ff6b35', borderStyle: 'dashed' },
  burnTitle: { color: '#ff6b35', fontSize: 16, fontWeight: 'bold' },
  burnStat: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 6 },
  burnSub: { color: '#888', fontSize: 12, marginTop: 4 },
});
