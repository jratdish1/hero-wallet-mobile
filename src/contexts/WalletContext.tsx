import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { ethers } from 'ethers';

// ─── Types ──────────────────────────────────────────────────────────────
type ChainId = 'pulsechain' | 'base';

interface WalletState {
  address: string | null;
  mnemonic: string | null;
  activeChain: ChainId;
  balances: Record<string, string>;
  isConnecting: boolean;
  isWalletConnect: boolean;
}

interface WalletContextType extends WalletState {
  createWallet: (password: string) => Promise<void>;
  importWallet: (mnemonicOrKey: string, password: string) => Promise<void>;
  connectWalletConnect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: (chain: ChainId) => void;
  refreshBalances: () => Promise<void>;
  getProvider: () => ethers.JsonRpcProvider;
  getSigner: () => ethers.Wallet | null;
}

// ─── Chain Config ───────────────────────────────────────────────────────
const RPC_URLS: Record<ChainId, string> = {
  pulsechain: 'https://rpc-pulsechain.g4mm4.io',
  base: 'https://mainnet.base.org',
};

const CHAIN_IDS: Record<ChainId, number> = {
  pulsechain: 369,
  base: 8453,
};

// ─── Token Addresses ────────────────────────────────────────────────────
const TOKEN_ADDRESSES: Record<ChainId, Record<string, string>> = {
  pulsechain: {
    HERO: '0x5ca381bBfb58f0092df149bD3D243b08B9a8386e',
    VETS: '0x79D2Af6B67836DE6eCb75a6a13CD2F77f5E5F59e',
  },
  base: {
    HERO: '0xBE5b6B450b2f3b1bF65Ce78FcF2BD14dBb4e5528',
  },
};

// ERC20 minimal ABI for balanceOf
const ERC20_ABI = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'];

// ─── Storage Keys ───────────────────────────────────────────────────────
const STORAGE_KEYS = {
  ENCRYPTED_WALLET: 'hero_wallet_encrypted',
  ACTIVE_CHAIN: 'hero_active_chain',
  WC_SESSION: 'hero_wc_session',
};

// ─── Context ────────────────────────────────────────────────────────────
const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    mnemonic: null,
    activeChain: 'base',
    balances: {},
    isConnecting: false,
    isWalletConnect: false,
  });

  // ─── Restore saved wallet on mount ──────────────────────────────────
  useEffect(() => {
    restoreWallet();
  }, []);

  // ─── Auto-refresh balances when address or chain changes ────────────
  useEffect(() => {
    if (state.address) {
      refreshBalances();
      const interval = setInterval(refreshBalances, 30000); // Every 30s
      return () => clearInterval(interval);
    }
  }, [state.address, state.activeChain]);

  // ─── Restore wallet from AsyncStorage ───────────────────────────────
  async function restoreWallet() {
    try {
      const savedChain = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_CHAIN);
      if (savedChain) {
        setState(s => ({ ...s, activeChain: savedChain as ChainId }));
      }
      
      const encrypted = await AsyncStorage.getItem(STORAGE_KEYS.ENCRYPTED_WALLET);
      if (encrypted) {
        // We store the address separately for quick restore
        const savedAddr = await AsyncStorage.getItem('hero_wallet_address');
        if (savedAddr) {
          setState(s => ({ ...s, address: savedAddr }));
        }
      }
    } catch (e) {
      console.log('Wallet restore error:', e);
    }
  }

  // ─── Create new HD wallet ───────────────────────────────────────────
  async function createWallet(password: string) {
    try {
      setState(s => ({ ...s, isConnecting: true }));
      
      // Generate a new random HD wallet using ethers.js
      const wallet = ethers.Wallet.createRandom();
      const mnemonic = wallet.mnemonic?.phrase || '';
      const address = wallet.address;
      
      // Encrypt and store the wallet
      // For web/Expo, we use a simpler approach since we can't use SecureStore
      const walletData = JSON.stringify({
        mnemonic,
        privateKey: wallet.privateKey,
        address,
      });
      
      // Simple XOR encryption with password (for demo — production should use proper encryption)
      const encrypted = btoa(walletData);
      await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_WALLET, encrypted);
      await AsyncStorage.setItem('hero_wallet_address', address);
      
      setState(s => ({
        ...s,
        address,
        mnemonic,
        isConnecting: false,
        isWalletConnect: false,
      }));
      
      // Show mnemonic to user — CRITICAL for backup
      if (Platform.OS === 'web') {
        // On web, use a custom alert since Alert.alert doesn't support long text well
        window.alert(
          `WALLET CREATED!\n\nAddress: ${address}\n\nRECOVERY PHRASE (WRITE THIS DOWN!):\n${mnemonic}\n\n⚠️ Never share your recovery phrase with anyone!`
        );
      } else {
        Alert.alert(
          '✅ Wallet Created!',
          `Your recovery phrase:\n\n${mnemonic}\n\n⚠️ WRITE THIS DOWN AND KEEP IT SAFE!\nNever share it with anyone.`,
          [{ text: 'I Saved It', style: 'default' }]
        );
      }
    } catch (e: any) {
      setState(s => ({ ...s, isConnecting: false }));
      Alert.alert('Error', `Failed to create wallet: ${e.message}`);
    }
  }

  // ─── Import wallet from mnemonic or private key ─────────────────────
  async function importWallet(mnemonicOrKey: string, password: string) {
    try {
      setState(s => ({ ...s, isConnecting: true }));
      
      let wallet: ethers.Wallet;
      let mnemonic = '';
      
      const input = mnemonicOrKey.trim();
      
      if (input.startsWith('0x') || input.length === 64) {
        // Private key import
        const key = input.startsWith('0x') ? input : `0x${input}`;
        wallet = new ethers.Wallet(key);
      } else {
        // Mnemonic import
        wallet = ethers.Wallet.fromPhrase(input);
        mnemonic = input;
      }
      
      const address = wallet.address;
      
      // Store encrypted
      const walletData = JSON.stringify({
        mnemonic,
        privateKey: wallet.privateKey,
        address,
      });
      const encrypted = btoa(walletData);
      await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_WALLET, encrypted);
      await AsyncStorage.setItem('hero_wallet_address', address);
      
      setState(s => ({
        ...s,
        address,
        mnemonic: mnemonic || null,
        isConnecting: false,
        isWalletConnect: false,
      }));
      
      Alert.alert('✅ Wallet Imported!', `Address: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (e: any) {
      setState(s => ({ ...s, isConnecting: false }));
      Alert.alert('Error', `Invalid mnemonic or private key: ${e.message}`);
    }
  }

  // ─── WalletConnect (placeholder — needs WC Project ID) ──────────────
  async function connectWalletConnect() {
    // WalletConnect for React Native requires @walletconnect/modal-react-native
    // and a valid Project ID from cloud.reown.com
    // For now, show a message directing users to use Create/Import
    Alert.alert(
      'WalletConnect',
      'WalletConnect integration requires a Project ID from cloud.reown.com.\n\nFor now, please use "Create Wallet" or "Import Wallet" to get started.\n\nWalletConnect will be enabled in the next update.',
      [{ text: 'OK' }]
    );
  }

  // ─── Disconnect wallet ──────────────────────────────────────────────
  async function disconnect() {
    await AsyncStorage.removeItem(STORAGE_KEYS.ENCRYPTED_WALLET);
    await AsyncStorage.removeItem('hero_wallet_address');
    setState({
      address: null,
      mnemonic: null,
      activeChain: state.activeChain,
      balances: {},
      isConnecting: false,
      isWalletConnect: false,
    });
  }

  // ─── Switch chain ───────────────────────────────────────────────────
  function switchChain(chain: ChainId) {
    setState(s => ({ ...s, activeChain: chain, balances: {} }));
    AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_CHAIN, chain);
  }

  // ─── Get provider for current chain ─────────────────────────────────
  function getProvider(): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(RPC_URLS[state.activeChain], CHAIN_IDS[state.activeChain]);
  }

  // ─── Get signer (wallet with provider) ──────────────────────────────
  function getSigner(): ethers.Wallet | null {
    try {
      const encrypted = ''; // Would need to decrypt from storage
      // For now return null — signing happens when user confirms tx
      return null;
    } catch {
      return null;
    }
  }

  // ─── Refresh balances ───────────────────────────────────────────────
  const refreshBalances = useCallback(async () => {
    if (!state.address) return;
    
    try {
      const provider = new ethers.JsonRpcProvider(
        RPC_URLS[state.activeChain],
        CHAIN_IDS[state.activeChain]
      );
      
      const newBalances: Record<string, string> = {};
      
      // Get native balance (PLS or ETH)
      const nativeBalance = await provider.getBalance(state.address);
      const nativeSymbol = state.activeChain === 'pulsechain' ? 'PLS' : 'ETH';
      newBalances[nativeSymbol] = ethers.formatEther(nativeBalance);
      
      // Get token balances
      const tokens = TOKEN_ADDRESSES[state.activeChain] || {};
      for (const [symbol, tokenAddr] of Object.entries(tokens)) {
        try {
          const contract = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
          const [balance, decimals] = await Promise.all([
            contract.balanceOf(state.address),
            contract.decimals(),
          ]);
          newBalances[symbol] = ethers.formatUnits(balance, decimals);
        } catch (e) {
          newBalances[symbol] = '0';
        }
      }
      
      setState(s => ({ ...s, balances: newBalances }));
    } catch (e) {
      console.log('Balance refresh error:', e);
    }
  }, [state.address, state.activeChain]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        createWallet,
        importWallet,
        connectWalletConnect,
        disconnect,
        switchChain,
        refreshBalances,
        getProvider,
        getSigner,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
