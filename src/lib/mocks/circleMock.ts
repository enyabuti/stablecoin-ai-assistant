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
        { currency: "USDC", amount: "1000.00" },
        { currency: "EURC", amount: "850.00" },
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
}