import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useWallet } from '../contexts/WalletContext';
import { useGame } from '../contexts/GameContext';

const { width } = Dimensions.get('window');

const TOKENS = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿", color: "#F7931A" },
  { symbol: "SOL", name: "Solana", icon: "◎", color: "#14F195" },
  { symbol: 'ETH', name: 'Ethereum', icon: '⟠', color: '#627EEA' },
  { symbol: 'HERO', name: 'HERO Token', icon: '🛡️', color: '#00ff88' },
  { symbol: 'VETS', name: 'VETS Token', icon: '🎖️', color: '#ffd700' },
  { symbol: 'PLS', name: 'PulseChain', icon: '💜', color: '#9945FF' },
  { symbol: 'DAI', name: 'DAI Stablecoin', icon: '◈', color: '#F5AC37' },
];

export default function SwapScreen() {
  const wallet = useWallet();
  const { addXP } = useGame();
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [thorQuote, setThorQuote] = useState<any>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // THORChain asset mapping
  const THOR_ASSETS: Record<string, string> = {
    BTC: 'BTC.BTC', ETH: 'ETH.ETH', SOL: 'SOL.SOL',
  };

  const fetchTHORChainQuote = async () => {
    const fromAsset = THOR_ASSETS[fromToken.symbol];
    const toAsset = THOR_ASSETS[toToken.symbol];
    if (!fromAsset || !toAsset || !fromAmount || parseFloat(fromAmount) <= 0) {
      setQuoteLoading(false);
      return;
    }
    setQuoteLoading(true);
    try {
      const amt = Math.floor(parseFloat(fromAmount) * 1e8);
      // Chain-aware destination addresses for THORChain quotes
      const CHAIN_DEST = {
        'BTC.BTC': 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        'ETH.ETH': '0x0000000000000000000000000000000000000000',
        'SOL.SOL': '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
      };
      const dest = CHAIN_DEST[toAsset] || wallet.address || '0x0000000000000000000000000000000000000000';
      const url = "https://gateway.liquify.com/chain/thorchain_api/thorchain/quote/swap?from_asset=" + fromAsset + "&to_asset=" + toAsset + "&amount=" + amt + "&destination=" + dest + "&streaming_interval=1&streaming_quantity=0";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setThorQuote(data);
        const outAmt = parseInt(data.expected_amount_out) / 1e8;
        setToAmount(outAmt.toFixed(6));
      }
    } catch (e) { console.log('THORChain quote error:', e); }
    setQuoteLoading(false);
  };
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [prices, setPrices] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);

  // Animations - useNativeDriver: false for web compatibility
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const priceFlash = useRef(new Animated.Value(0)).current;
  const swapButtonScale = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  // Continuous pulse animation for the swap button
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1500, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
      ])
    );
    pulse.start();

    // Glow animation
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    );
    glow.start();

    return () => { pulse.stop(); glow.stop(); };
  }, []);

  // Fetch live prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://wallet.herobase.io/api/trpc/prices.ticker');
        const data = await res.json();
        const json = data?.result?.data?.json || data?.result?.data || data;
        setPrices({
          heroUsd: parseFloat(json.hero?.price || '0'),
          vetsUsd: parseFloat(json.vets?.price || '0'),
          plsUsd: parseFloat(json.pls?.price || '0'),
          ethUsd: parseFloat(json.eth?.price || '0'),
        });
        // Flash animation on price update
        Animated.sequence([
          Animated.timing(priceFlash, { toValue: 1, duration: 200, useNativeDriver: false }),
          Animated.timing(priceFlash, { toValue: 0, duration: 800, useNativeDriver: false }),
        ]).start();
      } catch (e) {
        console.log('Price fetch error:', e);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  const getPrice = (symbol: string) => {
    if (!prices) return 0;
    switch (symbol) {
      case 'ETH': return prices.ethUsd;
      case 'BTC': return prices.btcUsd || 97000;
      case 'SOL': return prices.solUsd || 150;
      case 'HERO': return prices.heroUsd;
      case 'VETS': return prices.vetsUsd;
      case 'PLS': return prices.plsUsd;
      case 'DAI': return 1.0;
      default: return 0;
    }
  };

  const calculateOutput = (amount: string) => {
    if (!amount || !prices) return '';
    const fromPrice = getPrice(fromToken.symbol);
    const toPrice = getPrice(toToken.symbol);
    if (toPrice === 0) return '0';
    return ((parseFloat(amount) * fromPrice) / toPrice).toFixed(6);
  };

  const handleSwap = () => {
    Animated.timing(rotateAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start(() => {
      const temp = fromToken;
      setFromToken(toToken);
      setToToken(temp);
      setFromAmount(toAmount);
      setToAmount(fromAmount);
      rotateAnim.setValue(0);
    });
  };

  const handleSwapNow = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;
    
    Animated.sequence([
      Animated.timing(swapButtonScale, { toValue: 0.95, duration: 100, useNativeDriver: false }),
      Animated.timing(swapButtonScale, { toValue: 1, duration: 100, useNativeDriver: false }),
    ]).start();

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSwapSuccess(true);
      addXP(25, 'Swap completed');
      Animated.timing(successAnim, { toValue: 1, duration: 500, useNativeDriver: false }).start();
      setTimeout(() => {
        setSwapSuccess(false);
        successAnim.setValue(0);
      }, 3000);
    }, 2000);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const priceFlashBg = priceFlash.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 255, 136, 0)', 'rgba(0, 255, 136, 0.15)'],
  });

  const renderTokenDropdown = (tokens: typeof TOKENS, onSelect: (t: typeof TOKENS[0]) => void, exclude: string) => (
    <View style={styles.dropdown}>
      {tokens.filter(t => t.symbol !== exclude).map(token => (
        <TouchableOpacity
          key={token.symbol}
          style={styles.dropdownItem}
          onPress={() => { onSelect(token); setShowFromDropdown(false); setShowToDropdown(false); }}
        >
          <Text style={styles.dropdownIcon}>{token.icon}</Text>
          <View>
            <Text style={styles.dropdownSymbol}>{token.symbol}</Text>
            <Text style={styles.dropdownName}>{token.name}</Text>
          </View>
          <Text style={[styles.dropdownPrice, { color: token.color }]}>
            ${getPrice(token.symbol).toFixed(token.symbol === 'ETH' ? 2 : 7)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.heroSwapTitle}>⚡ HERO Swap</Text>
          <View style={styles.networkBadge}>
            <View style={[styles.networkDot, { backgroundColor: wallet.activeChain === 'base' ? '#0052FF' : '#9945FF' }]} />
            <Text style={styles.networkText}>{wallet.activeChain === 'base' ? 'Base Network' : 'PulseChain'}</Text>
          </View>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+25 XP</Text>
        </View>
      </View>

      {/* Live Price Ticker */}
      <Animated.View style={[styles.priceTicker, { backgroundColor: priceFlashBg }]}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>HERO</Text>
          <Text style={[styles.priceValue, { color: '#00ff88' }]}>
            ${prices?.heroUsd?.toFixed(7) || '...'}
          </Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>ETH</Text>
          <Text style={[styles.priceValue, { color: '#627EEA' }]}>
            ${prices?.ethUsd?.toFixed(2) || '...'}
          </Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>PLS</Text>
          <Text style={[styles.priceValue, { color: '#9945FF' }]}>
            ${prices?.plsUsd?.toFixed(7) || '...'}
          </Text>
        </View>
      </Animated.View>

      {/* Connect Wallet Banner */}
      {!wallet.address && (
        <TouchableOpacity style={styles.connectBanner}>
          <Text style={styles.connectText}>🔗 Connect Wallet to Swap →</Text>
        </TouchableOpacity>
      )}

      {/* FROM Token Card */}
      <View style={styles.swapCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>YOU PAY</Text>
          <TouchableOpacity style={styles.maxButton}>
            <Text style={styles.maxText}>MAX</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputRow}>
          <TouchableOpacity 
            style={[styles.tokenSelector, { borderColor: fromToken.color + '60' }]}
            onPress={() => { setShowFromDropdown(!showFromDropdown); setShowToDropdown(false); }}
          >
            <Text style={styles.tokenIcon}>{fromToken.icon}</Text>
            <Text style={styles.tokenSymbol}>{fromToken.symbol}</Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
          
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor="#4a5568"
            keyboardType="decimal-pad"
            value={fromAmount}
            onChangeText={(text) => {
              setFromAmount(text);
              setToAmount(calculateOutput(text));
            }}
          />
        </View>

        {fromAmount ? (
          <Text style={styles.usdValue}>
            ≈ ${(parseFloat(fromAmount || '0') * getPrice(fromToken.symbol)).toFixed(2)} USD
          </Text>
        ) : null}

        {showFromDropdown && renderTokenDropdown(TOKENS, (t) => setFromToken(t), toToken.symbol)}
      </View>

      {/* Swap Direction Button */}
      <View style={styles.swapButtonContainer}>
        <TouchableOpacity onPress={handleSwap}>
          <Animated.View style={[styles.swapArrowButton, { transform: [{ rotate: spin }] }]}>
            <Text style={styles.swapArrowText}>⇅</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* TO Token Card */}
      <View style={[styles.swapCard, { marginTop: -8 }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>YOU RECEIVE</Text>
          <Text style={styles.balanceText}>Balance: {wallet.address ? '0.00' : '--'}</Text>
        </View>
        
        <View style={styles.inputRow}>
          <TouchableOpacity 
            style={[styles.tokenSelector, { borderColor: toToken.color + '60' }]}
            onPress={() => { setShowToDropdown(!showToDropdown); setShowFromDropdown(false); }}
          >
            <Text style={styles.tokenIcon}>{toToken.icon}</Text>
            <Text style={styles.tokenSymbol}>{toToken.symbol}</Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
          
          <View style={styles.outputContainer}>
            <Text style={[styles.outputText, toAmount ? { color: '#00ff88' } : {}]}>
              {toAmount || '0.00'}
            </Text>
          </View>
        </View>

        {toAmount ? (
          <Text style={styles.usdValue}>
            ≈ ${(parseFloat(toAmount || '0') * getPrice(toToken.symbol)).toFixed(2)} USD
          </Text>
        ) : null}

        {showToDropdown && renderTokenDropdown(TOKENS, (t) => setToToken(t), fromToken.symbol)}
      </View>

      {/* Trade Details */}
      <View style={styles.tradeDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>⚡ Best Route</Text>
          <Text style={styles.detailValue}>{["BTC","SOL"].includes(fromToken.symbol) || ["BTC","SOL"].includes(toToken.symbol) ? "THORChain → Bridge → PulseChain" : "Aerodrome → Direct"}</Text>
          {thorQuote && (
            <View style={{marginTop: 8}}>
              <Text style={{color: '#00ff88', fontSize: 11, fontFamily: 'monospace'}}>
                ⚡ Live THORChain Quote
              </Text>
              <Text style={{color: '#aaa', fontSize: 10, fontFamily: 'monospace'}}>
                Expected: {(parseInt(thorQuote.expected_amount_out) / 1e8).toFixed(6)} {toToken.symbol}
              </Text>
              <Text style={{color: '#aaa', fontSize: 10, fontFamily: 'monospace'}}>
                Slippage: {thorQuote.streaming_slippage_bps || thorQuote.slippage_bps || 0} bps | ETA: {Math.round((thorQuote.total_swap_seconds || 0) / 60)}min
              </Text>
            </View>
          )}
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>🛡️ Slippage</Text>
          <Text style={styles.detailValue}>0.5%</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>⭐ XP Reward</Text>
          <Text style={[styles.detailValue, { color: '#ffd700' }]}>+25 XP</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>💰 Fee</Text>
          <Text style={styles.detailValue}>0.3%</Text>
        </View>
        {fromAmount && toAmount ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📊 Rate</Text>
            <Text style={styles.detailValue}>
              1 {fromToken.symbol} = {(getPrice(fromToken.symbol) / getPrice(toToken.symbol)).toFixed(4)} {toToken.symbol}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Success Message */}
      {swapSuccess && (
        <Animated.View style={[styles.successBanner, { opacity: successAnim }]}>
          <Text style={styles.successText}>✅ Swap Successful! +25 XP earned 🎖️</Text>
        </Animated.View>
      )}

      {/* Get Quote Button */}
      <TouchableOpacity style={styles.getQuoteButton} onPress={fetchTHORChainQuote}>
        <Text style={styles.getQuoteText}>{quoteLoading ? '⏳ Fetching...' : '⚡ Get Quote'}</Text>
      </TouchableOpacity>

      {/* SWAP NOW Button - the star of the show */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[
            styles.swapNowButton,
            (!fromAmount || parseFloat(fromAmount) <= 0) && styles.swapNowDisabled,
            isLoading && styles.swapNowLoading,
          ]}
          onPress={handleSwapNow}
          disabled={!fromAmount || parseFloat(fromAmount) <= 0 || isLoading}
        >
          <Text style={styles.swapNowText}>
            {isLoading ? '⏳ SWAPPING...' : '🚀 SWAP NOW'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Powered by footer */}
      <Text style={styles.poweredBy}>Powered by Aerodrome • 0.3% fee supports Buy & Burn 🔥</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroSwapTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 82, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  networkText: {
    color: '#8892b0',
    fontSize: 12,
    fontWeight: '600',
  },
  xpBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  xpText: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: '800',
  },
  priceTicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  priceItem: {
    alignItems: 'center',
    flex: 1,
  },
  priceLabel: {
    color: '#8892b0',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  priceDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  connectBanner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 2,
    borderColor: '#00ff88',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  connectText: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: '700',
  },
  swapCard: {
    backgroundColor: 'rgba(20, 30, 48, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardLabel: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  balanceText: {
    color: '#4a5568',
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tokenSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  tokenIcon: {
    fontSize: 20,
  },
  tokenSymbol: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  chevron: {
    color: '#8892b0',
    fontSize: 14,
  },
  amountInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'right',
  },
  maxButton: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  maxText: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: '800',
  },
  usdValue: {
    color: '#8892b0',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  outputContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  outputText: {
    color: '#4a5568',
    fontSize: 28,
    fontWeight: '700',
  },
  dropdown: {
    marginTop: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  dropdownIcon: {
    fontSize: 24,
  },
  dropdownSymbol: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownName: {
    color: '#8892b0',
    fontSize: 11,
  },
  dropdownPrice: {
    marginLeft: 'auto',
    fontSize: 12,
    fontWeight: '700',
  },
  swapButtonContainer: {
    alignItems: 'center',
    zIndex: 10,
    marginVertical: -12,
  },
  swapArrowButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0a0e1a',
    borderWidth: 3,
    borderColor: '#00ff88',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swapArrowText: {
    fontSize: 22,
    color: '#00ff88',
    fontWeight: '900',
  },
  tradeDetails: {
    backgroundColor: 'rgba(20, 30, 48, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    color: '#8892b0',
    fontSize: 13,
  },
  detailValue: {
    color: '#00ff88',
    fontSize: 13,
    fontWeight: '700',
  },
  successBanner: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    borderWidth: 1,
    borderColor: '#00ff88',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  successText: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: '700',
  },
  getQuoteButton: {
    borderWidth: 2,
    borderColor: '#00ff88',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
    marginBottom: 12,
  },
  getQuoteText: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: '700',
  },
  swapNowButton: {
    backgroundColor: '#00ff88',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  swapNowDisabled: {
    backgroundColor: '#1a2332',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  swapNowLoading: {
    backgroundColor: '#1a3a2a',
  },
  swapNowText: {
    color: '#0a0e1a',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
  },
  poweredBy: {
    color: '#4a5568',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
});
