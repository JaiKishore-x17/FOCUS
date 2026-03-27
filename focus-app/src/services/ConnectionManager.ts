import { useState, useEffect } from 'react';

type ConnectionStatus = number; // WebSocket.readyState values
type MessageCallback = (msg: string) => void;
type StatusCallback = (status: ConnectionStatus) => void;

class ConnectionManager {
  private static instance: ConnectionManager;
  private ws: WebSocket | null = null;
  private statusListeners: Set<StatusCallback> = new Set();
  private messageListeners: Set<MessageCallback> = new Set();
  private lastIp: string = '192.168.4.1';

  private constructor() {}

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  connect(ip: string) {
    this.lastIp = ip;
    if (this.ws) {
      this.ws.close();
    }

    try {
      // Typically ESP32 WebSocket servers run on port 81
      this.ws = new WebSocket(`ws://${ip}:81`);

      this.ws.onopen = () => {
        this.notifyStatusListeners();
      };

      this.ws.onmessage = (event) => {
        this.notifyMessageListeners(event.data);
      };

      this.ws.onclose = () => {
        this.notifyStatusListeners();
      };

      this.ws.onerror = () => {
        this.notifyStatusListeners();
      };
    } catch (error) {
      console.error('WebSocket Connection Error:', error);
      this.notifyStatusListeners();
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
      return true;
    }
    return false;
  }

  getStatus(): ConnectionStatus {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }

  getIp(): string {
    return this.lastIp;
  }

  subscribeStatus(callback: StatusCallback) {
    this.statusListeners.add(callback);
    callback(this.getStatus());
    return () => { this.statusListeners.delete(callback); };
  }

  subscribeMessages(callback: MessageCallback) {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  private notifyStatusListeners() {
    const status = this.getStatus();
    this.statusListeners.forEach(callback => callback(status));
  }

  private notifyMessageListeners(msg: string) {
    this.messageListeners.forEach(callback => callback(msg));
  }
}

export const connectionManager = ConnectionManager.getInstance();

// Hook for easy usage in components
export const useConnectionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>(connectionManager.getStatus());

  useEffect(() => {
    return connectionManager.subscribeStatus(setStatus);
  }, []);

  return status;
};
