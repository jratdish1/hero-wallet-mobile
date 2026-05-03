import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useWallet } from '../contexts/WalletContext';

export default function ReceiveScreen() {
  const { address, activeChain } = useWallet();

  async function copyAddress() {
    if (address) {
      await Clipboard.setStringAsync(address);
      Alert.alert('Copied', 'Address copied to clipboard');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receive</Text>
      <Text style={styles.subtitle}>Share your address to receive tokens on {activeChain === 'base' ? 'Base' : 'PulseChain'}</Text>

      <View style={styles.qrPlaceholder}>
        <Text style={styles.qrText}>QR</Text>
      </View>

      <View style={styles.addressBox}>
        <Text style={styles.addressLabel}>Your Address</Text>
        <Text style={styles.address}>{address}</Text>
      </View>

      <TouchableOpacity style={styles.copyBtn} onPress={copyAddress}>
        <Text style={styles.copyBtnText}>Copy Address</Text>
      </TouchableOpacity>

      <Text style={styles.warning}>
        Only send tokens on the {activeChain === 'base' ? 'Base (Chain ID: 8453)' : 'PulseChain (Chain ID: 369)'} network to this address.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a', padding: 20, alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: '#888', fontSize: 14, marginBottom: 30 },
  qrPlaceholder: { width: 200, height: 200, backgroundColor: '#fff', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  qrText: { color: '#000', fontSize: 48, fontWeight: 'bold' },
  addressBox: { width: '100%', backgroundColor: '#1a1f2e', borderRadius: 12, padding: 16, marginBottom: 16 },
  addressLabel: { color: '#888', fontSize: 12, marginBottom: 8 },
  address: { color: '#fff', fontSize: 13, fontFamily: 'monospace' },
  copyBtn: { backgroundColor: '#00d4aa', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 40, marginBottom: 20 },
  copyBtnText: { color: '#0a0e1a', fontSize: 16, fontWeight: 'bold' },
  warning: { color: '#ff6b35', fontSize: 12, textAlign: 'center', paddingHorizontal: 20 },
});
