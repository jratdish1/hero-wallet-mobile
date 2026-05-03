import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { CHAIN_CONFIG } from '../config/tokens';

export default function SendScreen() {
  const { address, activeChain, getSigner, refreshBalances } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  const config = CHAIN_CONFIG[activeChain];

  async function handleSend() {
    if (!recipient || !amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!ethers.isAddress(recipient)) {
      Alert.alert('Error', 'Invalid recipient address');
      return;
    }

    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} ${config.nativeSymbol} to ${recipient.slice(0, 8)}...${recipient.slice(-6)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setSending(true);
            try {
              const signer = await getSigner();
              if (!signer) throw new Error('Wallet locked');
              
              const tx = await signer.sendTransaction({
                to: recipient,
                value: ethers.parseEther(amount),
              });
              
              Alert.alert('Success', `TX sent: ${tx.hash.slice(0, 12)}...`);
              setRecipient('');
              setAmount('');
              await refreshBalances();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Transaction failed');
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send {config.nativeSymbol}</Text>
      <Text style={styles.chainLabel}>Network: {config.name}</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Recipient Address</Text>
        <TextInput
          style={styles.input}
          placeholder="0x..."
          placeholderTextColor="#555"
          value={recipient}
          onChangeText={setRecipient}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Amount ({config.nativeSymbol})</Text>
        <TextInput
          style={styles.input}
          placeholder="0.0"
          placeholderTextColor="#555"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
      </View>

      <TouchableOpacity
        style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={sending}
      >
        <Text style={styles.sendBtnText}>{sending ? 'Sending...' : 'Send'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a', padding: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  chainLabel: { color: '#00d4aa', fontSize: 14, marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#888', fontSize: 14, marginBottom: 8 },
  input: { backgroundColor: '#1a1f2e', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#2a2f3e' },
  sendBtn: { backgroundColor: '#00d4aa', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 20 },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: '#0a0e1a', fontSize: 18, fontWeight: 'bold' },
});
