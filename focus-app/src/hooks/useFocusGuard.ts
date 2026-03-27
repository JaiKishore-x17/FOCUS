import { useState, useEffect, useRef, useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import WifiManager from 'react-native-wifi-reborn';

const ESP32_URL = 'ws://192.168.4.1:81';
const HEARTBEAT_INTERVAL = 2000;
const THROTTLE_MS = 33; // ~30fps

// Global state to persist connection across tab switches
let globalSocket: WebSocket | null = null;
let globalIsConnected = false;
let globalState = { pan: 90, tilt: 90, laser: 0 };
let lastSentTime = 0;
const statusListeners = new Set<(connected: boolean) => void>();
const messageListeners = new Set<(msg: string) => void>();

const notifyStatus = (connected: boolean) => {
  globalIsConnected = connected;
  statusListeners.forEach(l => l(connected));
};

const notifyMessage = (msg: string) => {
  messageListeners.forEach(l => l(msg));
};

const connect = () => {
  if (globalSocket) {
    if (globalSocket.readyState === WebSocket.OPEN || globalSocket.readyState === WebSocket.CONNECTING) return;
    globalSocket.close();
  }

  try {
    const ws = new WebSocket(ESP32_URL);
    globalSocket = ws;

    ws.onopen = () => {
      notifyStatus(true);
      console.log('FocusGuard Connected');
    };

    ws.onmessage = (e) => {
      notifyMessage(e.data);
    };

    ws.onclose = () => {
      notifyStatus(false);
      console.log('FocusGuard Disconnected');
    };

    ws.onerror = (e) => {
      notifyStatus(false);
      console.error('FocusGuard Error', e);
    };
  } catch (err) {
    notifyStatus(false);
  }
};

// Initial connection
connect();

// Heartbeat
setInterval(() => {
  if (!globalSocket || globalSocket.readyState === WebSocket.CLOSED) {
    connect();
  } else {
    notifyStatus(globalSocket.readyState === WebSocket.OPEN);
  }
}, HEARTBEAT_INTERVAL);

export const useFocusGuard = () => {
  const [isConnected, setIsConnected] = useState(globalIsConnected);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleStatusChange = (status: boolean) => setIsConnected(status);
    const handleMessage = (msg: string) => setLastMessage(msg);

    statusListeners.add(handleStatusChange);
    messageListeners.add(handleMessage);
    
    // Sync initial state
    setIsConnected(globalIsConnected);

    return () => {
      statusListeners.delete(handleStatusChange);
      messageListeners.delete(handleMessage);
    };
  }, []);

  const sendUpdate = useCallback((pan?: number, tilt?: number, laser?: number) => {
    const now = Date.now();
    
    // Update global state
    if (pan !== undefined) globalState.pan = Math.round(pan);
    if (tilt !== undefined) globalState.tilt = Math.round(tilt);
    if (laser !== undefined) globalState.laser = laser;

    if (now - lastSentTime < THROTTLE_MS) return; // Throttle to 30fps

    if (globalSocket && globalSocket.readyState === WebSocket.OPEN) {
      // Protocol: P120T45L1
      const payload = `P${globalState.pan}T${globalState.tilt}L${globalState.laser}`;
      globalSocket.send(payload);
      lastSentTime = now;
    }
  }, []);

  const commit = useCallback(() => {
    if (globalSocket && globalSocket.readyState === WebSocket.OPEN) {
      const payload = `P${globalState.pan}T${globalState.tilt}L${globalState.laser}`;
      globalSocket.send(payload);
    }
  }, []);

  const sendRaw = useCallback((payload: string) => {
    if (globalSocket && globalSocket.readyState === WebSocket.OPEN) {
      globalSocket.send(payload);
    }
  }, []);

  const connectToDeviceWifi = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Focus-Guard Location Permission',
            message: 'Focus-Guard needs access to your location to scan for the hardware Wi-Fi network.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission denied');
          return false;
        }
      }

      await WifiManager.connectToProtectedSSID('FocusGuard_AP32', '0987654321', false, true);
      console.log('Connected to FocusGuard_AP32');
      return true;
    } catch (error) {
      console.error('Wifi Connection Error:', error);
      return false;
    }
  }, []);

  return { isConnected, lastMessage, sendUpdate, commit, sendRaw, connectToDeviceWifi, systemState: globalState };
};
