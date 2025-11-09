/**
 * API Client utilities for frontend-backend communication
 */

export interface Order {
  id: string;
  underlying: string;
  direction: 'LONG' | 'SHORT';
  strikeMin: number;
  strikeMax: number;
  notional: number;
  expiry: string;
  tolDays: number;
  status: string;
  createdAt: string;
  user?: {
    id: string;
    wallet: string;
  };
}

export interface Match {
  id: string;
  orderAId: string;
  orderBId: string;
  state: string;
  contractAddress?: string;
  orderA?: Order;
  orderB?: Order;
}

export interface Contract {
  id: string;
  underlying: string;
  strikePrice: number;
  notional: number;
  expiry: string;
  position: 'YES' | 'NO';
  cost: number;
  payout: number;
  status: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  analysis?: {
    suggestRisks: boolean;
    suggestContracts: boolean;
    detectedRisks: string[];
    detectedBusiness: string;
  };
  fallback?: boolean;
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Network error',
      }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Orders API
  async getOrders(filters?: {
    underlying?: string;
    direction?: 'LONG' | 'SHORT';
    status?: string;
  }): Promise<{ orders: Order[] }> {
    const params = new URLSearchParams();
    if (filters?.underlying) params.append('underlying', filters.underlying);
    if (filters?.direction) params.append('direction', filters.direction);
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString();
    return this.request(`/api/orders${query ? `?${query}` : ''}`);
  }

  async createOrder(order: {
    underlying: string;
    direction: 'LONG' | 'SHORT';
    strikeMin: number;
    strikeMax: number;
    notional: number;
    expiry: string;
    tolDays?: number;
  }): Promise<{ order: Order }> {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async getOrder(id: string): Promise<{ order: Order }> {
    return this.request(`/api/orders/${id}`);
  }

  // Matches API
  async createMatch(orderAId: string, orderBId: string): Promise<{ match: Match }> {
    return this.request('/api/matches', {
      method: 'POST',
      body: JSON.stringify({ orderAId, orderBId }),
    });
  }

  async getMatch(id: string): Promise<{ match: Match }> {
    return this.request(`/api/matches/${id}`);
  }

  async signMatch(id: string, signature: string): Promise<{ match: Match }> {
    return this.request(`/api/matches/${id}/sign`, {
      method: 'POST',
      body: JSON.stringify({ signature }),
    });
  }

  async counterMatch(
    id: string,
    counterTerms: {
      strikeMin: number;
      strikeMax: number;
      notional: number;
      expiry: string;
    }
  ): Promise<{ match: Match }> {
    return this.request(`/api/matches/${id}/counter`, {
      method: 'POST',
      body: JSON.stringify(counterTerms),
    });
  }

  // Contracts API
  async getContracts(filters?: {
    status?: string;
    userId?: string;
  }): Promise<{ contracts: Contract[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.userId) params.append('userId', filters.userId);

    const query = params.toString();
    return this.request(`/api/contracts${query ? `?${query}` : ''}`);
  }

  async getContract(id: string): Promise<{ contract: Contract }> {
    return this.request(`/api/contracts/${id}`);
  }

  async initializeContract(matchId: string): Promise<{
    contract: Contract;
    txHash: string;
  }> {
    return this.request('/api/contracts/initialize', {
      method: 'POST',
      body: JSON.stringify({ matchId }),
    });
  }

  // Chat API
  async sendChatMessage(
    messages: ChatMessage[],
    businessContext?: any
  ): Promise<ChatResponse> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, businessContext }),
    });
  }

  // Matching candidates
  async getMatchCandidates(orderId: string): Promise<{ candidates: Order[] }> {
    return this.request(`/api/match/candidates?orderId=${orderId}`);
  }
}

export const apiClient = new APIClient();

