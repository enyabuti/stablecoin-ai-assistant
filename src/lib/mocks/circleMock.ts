import { nanoid } from "nanoid";
import type { Chain } from "@/lib/llm/schema";

export interface CircleUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface CircleWallet {
  id: string;
  userId: string;
  blockchain: string;
  address: string;
  state: "LIVE" | "COLD";
  balances: Array<{
    currency: string;
    amount: string;
  }>;
}

export interface CircleTransfer {
  id: string;
  source: { type: "wallet"; id: string };
  destination: { type: "blockchain"; address: string; chain: string };
  amount: { currency: string; amount: string };
  status: "pending" | "running" | "complete" | "failed";
  transactionHash?: string;
  createDate: string;
  updateDate: string;
  errorCode?: string;
  errorMessage?: string;
  gasUsed?: string;
  blockNumber?: number;
  confirmations?: number;
}

export interface CircleClient {
  createUser(email: string): Promise<CircleUser>;
  createWallet(userId: string, chain: Chain): Promise<CircleWallet>;
  transferUSDC(params: {
    walletId: string;
    destinationAddress: string;
    amount: string;
    chain: Chain;
    idempotencyKey: string;
  }): Promise<CircleTransfer>;
  transferCCTP(params: {
    walletId: string;
    destinationAddress: string;
    amount: string;
    destinationChain: Chain;
    idempotencyKey: string;
  }): Promise<CircleTransfer>;
  getWallet(walletId: string): Promise<CircleWallet>;
  getTransfer(transferId: string): Promise<CircleTransfer>;
  verifyWebhook(payload: string, signature: string): boolean;
}

export class MockCircleClient implements CircleClient {
  private users = new Map<string, CircleUser>();
  private wallets = new Map<string, CircleWallet>();
  private transfers = new Map<string, CircleTransfer>();
  private pendingTransfers = new Set<string>();
  
  // Configuration for realistic simulation
  private readonly FAILURE_RATE = 0.02; // 2% failure rate
  private readonly NETWORK_CONGESTION_FACTOR = Math.random() * 0.5 + 0.75; // 0.75-1.25x
  
  async createUser(email: string): Promise<CircleUser> {
    const user: CircleUser = {
      id: `mock-user-${nanoid()}`,
      email,
      createdAt: new Date().toISOString(),
    };
    
    this.users.set(user.id, user);
    return user;
  }
  
  async createWallet(userId: string, chain: Chain): Promise<CircleWallet> {
    const wallet: CircleWallet = {
      id: `mock-wallet-${nanoid()}`,
      userId,
      blockchain: chain,
      address: this.generateMockAddress(chain),
      state: "LIVE",
      balances: [
        { currency: "USDC", amount: this.generateRandomBalance(500, 2000) },
        { currency: "EURC", amount: this.generateRandomBalance(400, 1500) },
      ],
    };
    
    this.wallets.set(wallet.id, wallet);
    return wallet;
  }
  
  async transferUSDC(params: {
    walletId: string;
    destinationAddress: string;
    amount: string;
    chain: Chain;
    idempotencyKey: string;
  }): Promise<CircleTransfer> {
    const transfer: CircleTransfer = {
      id: `mock-transfer-${nanoid()}`,
      source: { type: "wallet", id: params.walletId },
      destination: { 
        type: "blockchain", 
        address: params.destinationAddress, 
        chain: params.chain 
      },
      amount: { currency: "USDC", amount: params.amount },
      status: "pending",
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
    };
    
    this.transfers.set(transfer.id, transfer);
    
    // Simulate async processing
    setTimeout(() => {
      transfer.status = "complete";
      transfer.transactionHash = this.generateMockTxHash();
      transfer.updateDate = new Date().toISOString();
    }, 2000);
    
    return transfer;
  }
  
  async transferCCTP(params: {
    walletId: string;
    destinationAddress: string;
    amount: string;
    destinationChain: Chain;
    idempotencyKey: string;
  }): Promise<CircleTransfer> {
    // For CCTP, we simulate a cross-chain transfer
    const transfer: CircleTransfer = {
      id: `mock-cctp-${nanoid()}`,
      source: { type: "wallet", id: params.walletId },
      destination: { 
        type: "blockchain", 
        address: params.destinationAddress, 
        chain: params.destinationChain 
      },
      amount: { currency: "USDC", amount: params.amount },
      status: "pending",
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
    };
    
    this.transfers.set(transfer.id, transfer);
    
    // CCTP takes longer (cross-chain)
    setTimeout(() => {
      transfer.status = "complete";
      transfer.transactionHash = this.generateMockTxHash();
      transfer.updateDate = new Date().toISOString();
    }, 10000);
    
    return transfer;
  }
  
  async getWallet(walletId: string): Promise<CircleWallet> {
    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new Error(`Wallet ${walletId} not found`);
    }
    return wallet;
  }
  
  async getTransfer(transferId: string): Promise<CircleTransfer> {
    const transfer = this.transfers.get(transferId);
    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found`);
    }
    return transfer;
  }
  
  verifyWebhook(payload: string, signature: string): boolean {
    // In a real implementation, verify HMAC signature
    // For mock, just return true
    return true;
  }
  
  private generateMockAddress(chain: Chain): string {
    // Generate realistic-looking addresses for different chains
    const chars = "0123456789abcdef";
    let address = "0x";
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  }
  
  private generateMockTxHash(): string {
    const chars = "0123456789abcdef";
    let hash = "0x";
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }
  
  // Enhanced methods implementation
  async refreshWalletBalance(walletId: string): Promise<CircleWallet> {
    const wallet = await this.getWallet(walletId);
    
    // Simulate balance fluctuation
    const balanceVariation = (Math.random() - 0.5) * 100; // ±$50 variation
    const currentUsdcBalance = parseFloat(wallet.balances[0].amount);
    const newUsdcBalance = Math.max(0, currentUsdcBalance + balanceVariation);
    
    wallet.balances[0].amount = newUsdcBalance.toFixed(2);
    this.wallets.set(walletId, wallet);
    
    return wallet;
  }
  
  async cancelTransfer(transferId: string): Promise<CircleTransfer> {
    const transfer = await this.getTransfer(transferId);
    
    if (transfer.status === "complete" || transfer.status === "failed") {
      throw new Error(`Cannot cancel transfer ${transferId}: already ${transfer.status}`);
    }
    
    transfer.status = "failed";
    transfer.errorCode = "USER_CANCELLED";
    transfer.errorMessage = "Transfer cancelled by user";
    transfer.updateDate = new Date().toISOString();
    
    this.transfers.set(transferId, transfer);
    this.pendingTransfers.delete(transferId);
    
    return transfer;
  }
  
  async estimateTransferTime(chain: Chain, destinationChain?: Chain): Promise<{ min: number; max: number; typical: number }> {
    if (destinationChain && destinationChain !== chain) {
      // Cross-chain transfer (CCTP)
      return {
        min: 8,
        max: 25,
        typical: 15,
      };
    }
    
    // Same-chain transfer times by network
    const chainTimes = {
      "ethereum": { min: 1, max: 8, typical: 3 },
      "polygon": { min: 0.5, max: 3, typical: 1 },
      "arbitrum": { min: 0.5, max: 2, typical: 1 },
      "optimism": { min: 0.5, max: 2, typical: 1 },
      "base": { min: 0.3, max: 1.5, typical: 0.8 },
      "avalanche": { min: 0.5, max: 2, typical: 1 },
    };
    
    return chainTimes[chain] || { min: 1, max: 5, typical: 2 };
  }
  
  validateAddress(address: string, chain: Chain): boolean {
    // Basic EVM address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return false;
    }
    
    // Additional chain-specific validations could be added here
    return true;
  }
  
  private simulateTransferProcessing(transfer: CircleTransfer, isCrossChain: boolean = false): void {
    this.pendingTransfers.add(transfer.id);
    
    const baseDelay = isCrossChain ? 10000 : 2000; // 10s for CCTP, 2s for same-chain
    const networkDelay = baseDelay * this.NETWORK_CONGESTION_FACTOR;
    const finalDelay = Math.max(1000, networkDelay + (Math.random() * 2000)); // Add jitter
    
    // Simulate intermediate "running" status
    setTimeout(() => {
      if (this.pendingTransfers.has(transfer.id)) {
        transfer.status = "running";
        transfer.updateDate = new Date().toISOString();
        this.transfers.set(transfer.id, transfer);
      }
    }, finalDelay * 0.3);
    
    // Simulate final completion or failure
    setTimeout(() => {
      if (!this.pendingTransfers.has(transfer.id)) {
        return; // Transfer was cancelled
      }
      
      const shouldFail = Math.random() < this.FAILURE_RATE;
      
      if (shouldFail) {
        transfer.status = "failed";
        transfer.errorCode = this.getRandomErrorCode();
        transfer.errorMessage = this.getErrorMessage(transfer.errorCode!);
      } else {
        transfer.status = "complete";
        transfer.transactionHash = this.generateMockTxHash();
        transfer.gasUsed = this.generateGasUsed(isCrossChain);
        transfer.blockNumber = this.generateBlockNumber();
        transfer.confirmations = isCrossChain ? 12 : 6;
      }
      
      transfer.updateDate = new Date().toISOString();
      this.transfers.set(transfer.id, transfer);
      this.pendingTransfers.delete(transfer.id);
      
    }, finalDelay);
  }
  
  private getRandomErrorCode(): string {
    const errorCodes = [
      "INSUFFICIENT_FUNDS",
      "NETWORK_CONGESTION",
      "INVALID_DESTINATION",
      "RATE_LIMIT_EXCEEDED",
      "TEMPORARY_UNAVAILABLE",
    ];
    return errorCodes[Math.floor(Math.random() * errorCodes.length)];
  }
  
  private getErrorMessage(errorCode: string): string {
    const messages = {
      "INSUFFICIENT_FUNDS": "Wallet balance insufficient for transfer amount plus fees",
      "NETWORK_CONGESTION": "Network congestion caused transfer timeout",
      "INVALID_DESTINATION": "Destination address validation failed",
      "RATE_LIMIT_EXCEEDED": "Transfer rate limit exceeded, please wait before retrying",
      "TEMPORARY_UNAVAILABLE": "Service temporarily unavailable, please retry",
    };
    return messages[errorCode as keyof typeof messages] || "Unknown error occurred";
  }
  
  private generateGasUsed(isCrossChain: boolean): string {
    const baseGas = isCrossChain ? 150000 : 50000;
    const variation = Math.random() * 0.2 - 0.1; // ±10%
    return Math.floor(baseGas * (1 + variation)).toString();
  }
  
  private generateBlockNumber(): number {
    // Simulate realistic block numbers
    const baseBlock = 18500000;
    return baseBlock + Math.floor(Math.random() * 100000);
  }
  
  private generateRandomBalance(min: number, max: number): string {
    const balance = min + Math.random() * (max - min);
    return balance.toFixed(2);
  }
}