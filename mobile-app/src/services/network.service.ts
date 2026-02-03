import { Network } from '@capacitor/network';

export interface NetworkStatus { connected: boolean; }

export const networkService = {
  async getStatus(): Promise<NetworkStatus> {
    const status = await Network.getStatus();
    return { connected: status.connected };
  },
  onChange(callback: (status: NetworkStatus) => void): () => void {
    const listener = Network.addListener('networkStatusChange', (status) => callback({ connected: status.connected }));
    return () => listener.remove();
  }
};
