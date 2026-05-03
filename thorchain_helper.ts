// THORChain Cross-Chain Swap Helper
// Fetches live swap quotes from THORChain API

const THORNODE_API = 'https://thornode.ninerealms.com/thorchain';

interface THORChainQuote {
  inbound_address: string;
  memo: string;
  expected_amount_out: string;
  fees: {
    total: string;
    slippage_bps: number;
    outbound: string;
  };
  expiry: number;
  recommended_min_amount_in: string;
  streaming_slippage_bps: number;
  total_swap_seconds: number;
}

export async function getTHORChainQuote(
  fromAsset: string,  // e.g., "BTC.BTC"
  toAsset: string,    // e.g., "ETH.ETH"
  amount: number,     // in native units (satoshis for BTC)
  destination: string // receiving address
): Promise<THORChainQuote | null> {
  try {
    const url = `${THORNODE_API}/quote/swap?from_asset=${fromAsset}&to_asset=${toAsset}&amount=${amount}&destination=${destination}&streaming_interval=1&streaming_quantity=0`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`THORChain API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('THORChain quote error:', error);
    return null;
  }
}

// Asset notation mapping
export const THORCHAIN_ASSETS: Record<string, string> = {
  'BTC': 'BTC.BTC',
  'ETH': 'ETH.ETH',
  'SOL': 'SOL.SOL',
  'USDC': 'ETH.USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  'USDT': 'ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7',
};

// Format amount for THORChain (1e8)
export function toThorAmount(amount: number, decimals: number = 8): number {
  return Math.floor(amount * Math.pow(10, decimals));
}

// Parse THORChain amount back to human readable
export function fromThorAmount(amount: string, decimals: number = 8): number {
  return parseInt(amount) / Math.pow(10, decimals);
}
