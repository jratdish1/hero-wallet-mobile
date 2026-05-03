export interface ChainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  nativeSymbol: string;
  heroAddress: string;
  vetsAddress?: string;
  explorerUrl: string;
}

export const CHAIN_CONFIG: Record<string, ChainConfig> = {
  base: {
    name: 'Base',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    nativeSymbol: 'ETH',
    heroAddress: '0x1f0ac4f015d87a2a69b04c25daa54e0e0c1c6b5e',
    explorerUrl: 'https://basescan.org',
  },
  pulsechain: {
    name: 'PulseChain',
    chainId: 369,
    rpcUrl: 'https://rpc.pulsechain.com',
    nativeSymbol: 'PLS',
    heroAddress: '0x420bfB7C6c1b34a6f8AC8b046834f0e0C8e1c7f4',
    vetsAddress: '0x5e3c572a97d898fe359bf4099784db9e6e5d187c',
    explorerUrl: 'https://scan.pulsechain.com',
  },
};

// Token display info for swap UI
export interface TokenInfo {
  symbol: string;
  name: string;
  icon: string;
  chains: number[];
  decimals: number;
}

export const TOKENS: Record<string, TokenInfo> = {
  ETH: { symbol: "ETH", name: "Ethereum", icon: "⟠", chains: [8453], decimals: 18 },
  HERO: { symbol: "HERO", name: "HERO Token", icon: "🛡️", chains: [8453, 369], decimals: 18 },
  VETS: { symbol: "VETS", name: "VETS Token", icon: "🎖️", chains: [369], decimals: 18 },
  PLS: { symbol: "PLS", name: "Pulse", icon: "💜", chains: [369], decimals: 18 },
  DAI: { symbol: "DAI", name: "DAI Stablecoin", icon: "💲", chains: [8453, 369], decimals: 18 },
};
