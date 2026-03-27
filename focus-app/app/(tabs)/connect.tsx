import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { MounSilverTheme } from '../../src/theme/theme';
import { useFocusGuard } from '../../src/hooks/useFocusGuard';

const TypedFlashList = FlashList as any;

// --- Types ---
interface NetworkNode {
  id: string;
  name: string;
  ip: string;
  rssi: number;
  isActive?: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'sent' | 'rcvd' | 'info' | 'error';
  message: string;
}

export default function ConnectScreen() {
  const { isConnected, lastMessage, sendRaw, connectToDeviceWifi } = useFocusGuard();
  const [isConnectingWifi, setIsConnectingWifi] = useState(false);
  const [nodes] = useState<NetworkNode[]>([
    { id: '1', name: 'FocusGuard_AP32', ip: '192.168.4.1', rssi: -42 },
  ]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [manualIp, setManualIp] = useState('192.168.4.1');
  const [cmdText, setCmdText] = useState('');
  const logRef = useRef<LogEntry[]>([]);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      message,
    };
    logRef.current = [newLog, ...logRef.current].slice(0, 50);
    setLogs([...logRef.current]);
  }, []);

  useEffect(() => {
    if (lastMessage) {
      addLog('rcvd', lastMessage);
    }
  }, [lastMessage, addLog]);

  useEffect(() => {
    addLog('info', isConnected ? 'FOCUS_GUARD_ONLINE' : 'SEARCHING_ENDPOINT...');
  }, [isConnected, addLog]);

  const handleHardwareLink = async () => {
    setIsConnectingWifi(true);
    addLog('info', 'ATTEMPTING_HARDWARE_WIFI_SWITCH...');
    const success = await connectToDeviceWifi();
    if (success) {
      addLog('info', 'WIFI_LINK_ESTABLISHED_SUCCESS');
    } else {
      addLog('error', 'WIFI_LINK_FAILED_PERMISSION_OR_TIMEOUT');
    }
    setIsConnectingWifi(false);
  };

  const handleConnect = () => {
    addLog('info', `INITIALIZING_WEBSOCKET: ws://${manualIp}:81`);
    // Connection is automatic in useFocusGuard, but we can log intent
  };

  const handleDisconnect = () => {
    // Disconnect logic if needed
  };

  const handleSend = () => {
    if (cmdText.trim()) {
      const formattedCmd = `>>> ${cmdText.trim().toUpperCase()}`;
      addLog('sent', formattedCmd);
      sendRaw(cmdText);
      setCmdText('');
    }
  };



  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <MaterialIcons name="security" size={24} color={MounSilverTheme.colors.primary} />
          <Text style={styles.headerTitle}>FOCUS</Text>
        </View>
        <View style={styles.statusGroup}>
          <View style={[styles.statusDot, isConnected && styles.statusDotActive]} />
          <View style={styles.avatarPlaceholder} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Navigation Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroBlur} />
          <View style={styles.heroHeader}>
            <Text style={styles.instrumentation}>NETWORK ARCHITECTURE</Text>
            <Text style={styles.heroTitle}>CONNECTIVITY</Text>
            <Text style={styles.heroSubtitle}>WebSocket-based real-time telemetry stream via local mesh.</Text>
          </View>

          <View style={styles.signalCard}>
            <View style={styles.signalIconContainer}>
                <View style={styles.metallicBorder}>
                    <View style={styles.signalIconInner}>
                        <Ionicons 
                            name={isConnected ? "wifi" : "wifi-outline"} 
                            size={28} 
                            color={isConnected ? "#10b981" : MounSilverTheme.colors.primary} 
                        />
                    </View>
                </View>
            </View>
            <View style={styles.signalInfo}>
                <Text style={styles.instrumentation}>WIFI RSSI</Text>
                <View style={styles.signalBars}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <View 
                            key={i} 
                            style={[
                                styles.bar, 
                                { height: i * 4, backgroundColor: (isConnected && i <= 4) ? "#10b981" : i <= 3 ? MounSilverTheme.colors.primary : '#e5e7eb' }
                            ]} 
                        />
                    ))}
                </View>
                <Text style={[styles.dbmValue, isConnected && { color: '#10b981' }]}>{isConnected ? -42 : '- -'} <Text style={styles.unit}>dBm</Text></Text>
            </View>
          </View>

          <Pressable 
              style={[styles.linkButton, isConnected && styles.linkButtonDisabled]} 
              onPress={handleHardwareLink}
              disabled={isConnectingWifi || isConnected}
          >
            <Ionicons name="flash-outline" size={16} color="white" />
            <Text style={styles.linkButtonText}>
                {isConnectingWifi ? 'LINKING...' : isConnected ? 'HARDWARE_LINKED' : 'INITIATE HARDWARE LINK'}
            </Text>
          </Pressable>
        </View>

        {/* Workspace Nodes */}
        <View style={styles.workspace}>
            <View style={styles.glassCard}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.instrumentation}>SSID: FocusGuard_AP32</Text>
                        <Text style={styles.ipDisplay}>IP: 192.168.4.1</Text>
                    </View>
                    <View style={styles.shieldIcon}>
                        <MaterialIcons name="security" size={20} color={MounSilverTheme.colors.primary} />
                    </View>
                </View>

                <View style={styles.deviceList}>
                    {nodes.map((node) => (
                        <View key={node.id} style={[styles.deviceRow, isConnected && styles.deviceRowActive]}>
                            <View style={styles.deviceInfoContainer}>
                                <View style={[styles.deviceIcon, isConnected && styles.deviceIconActive]}>
                                    <Ionicons 
                                        name="wifi" 
                                        size={18} 
                                        color={isConnected ? 'white' : MounSilverTheme.colors.primary} 
                                    />
                                </View>
                                <View style={styles.deviceText}>
                                    <View style={styles.nodeTitleLine}>
                                        <Text style={[styles.deviceName, isConnected && styles.deviceNameActive]}>{node.name}</Text>
                                        {isConnected && <View style={styles.activePill}><Text style={styles.pillText}>LIVE</Text></View>}
                                    </View>
                                    <Text style={[styles.deviceMac, isConnected && { color: 'rgba(255,255,255,0.5)' }]}>KEY: 0987654321</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* Terminal Window */}
            <View style={styles.terminalCard}>
                <View style={styles.terminalHeader}>
                    <Text style={[styles.instrumentation, { color: 'rgba(255,255,255,0.4)' }]}>SYSTEM STREAM</Text>
                    <View style={styles.dots}>
                        <View style={[styles.statusDotTerminal, isConnected && { backgroundColor: '#10b981' }]} />
                        <View style={[styles.dot, { backgroundColor: '#3f3f46' }]} />
                    </View>
                </View>
                
                <View style={styles.terminalListContainer}>
                    <TypedFlashList
                        data={logs}
                        keyExtractor={(item: any) => item.id}
                        estimatedItemSize={20}
                        inverted
                        renderItem={({ item }: any) => (
                            <View style={styles.logLine}>
                                <Text style={styles.logTime}>[{item.timestamp}]</Text>
                                <Text style={[styles.logMsg, item.type === 'sent' && styles.logSent, item.type === 'rcvd' && styles.logRcvd, item.type === 'error' && styles.logError]}>
                                    {item.message}
                                </Text>
                            </View>
                        )}
                    />
                </View>

                <View style={styles.terminalInputContainer}>
                    <Text style={styles.prompt}>&gt;</Text>
                    <TextInput
                        style={styles.terminalInput}
                        value={cmdText}
                        onChangeText={setCmdText}
                        placeholder="SEND_COMMAND..."
                        placeholderTextColor="#3f3f46"
                        onSubmitEditing={handleSend}
                    />
                </View>
            </View>

            {/* Metrics */}
            <View style={styles.metricGrid}>
                <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>LATENCY</Text>
                    <Text style={[styles.metricValue, isConnected && { color: '#10b981' }]}>{isConnected ? '4.12 MS' : '- -'}</Text>
                </View>
                <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>INTEGRITY</Text>
                    <Text style={[styles.metricValue, isConnected && { color: '#10b981' }]}>{isConnected ? '99.98%' : '- -'}</Text>
                </View>
            </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    fontSize: 13,
    letterSpacing: 2,
    color: MounSilverTheme.colors.primary,
    textTransform: 'uppercase',
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
  },
  statusDotActive: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MounSilverTheme.colors.activeIndicator,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120,
  },
  heroSection: {
    marginBottom: 24,
    position: 'relative',
  },
  heroBlur: {
    position: 'absolute',
    top: -48,
    left: -48,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: '#f4f4f5',
    opacity: 0.5,
  },
  heroHeader: {
    marginBottom: 24,
  },
  instrumentation: {
    fontSize: 9,
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    letterSpacing: 3,
    color: '#8e8e8e',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 36,
    fontFamily: MounSilverTheme.typography.fontFamily.light,
    letterSpacing: 4,
    color: MounSilverTheme.colors.primary,
    marginVertical: 4,
  },
  heroSubtitle: {
    fontSize: 10,
    fontFamily: MounSilverTheme.typography.fontFamily.medium,
    color: '#71717a',
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  signalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  signalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  metallicBorder: {
    width: '100%',
    height: '100%',
    padding: 1,
    borderRadius: 32,
    backgroundColor: '#e5e7eb',
  },
  signalIconInner: {
    flex: 1,
    borderRadius: 31,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  signalInfo: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 24,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
  dbmValue: {
    fontSize: 18,
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    letterSpacing: 2,
    color: MounSilverTheme.colors.primary,
  },
  unit: {
    fontSize: 9,
    opacity: 0.4,
  },
  workspace: {
    gap: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  ipInput: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: MounSilverTheme.colors.primary,
    marginTop: 4,
    padding: 0,
    letterSpacing: 3,
  },
  ipDisplay: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: MounSilverTheme.colors.primary,
    marginTop: 4,
    padding: 0,
    letterSpacing: 1,
  },
  shieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(17,19,24,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescanBtn: {
    backgroundColor: MounSilverTheme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rescanText: {
    color: 'white',
    fontSize: 9,
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    letterSpacing: 1,
  },
  deviceList: {
    gap: 12,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 0.5)',
  },
  deviceRowActive: {
    backgroundColor: MounSilverTheme.colors.primary,
  },
  deviceInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MounSilverTheme.colors.activeIndicator,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceIconActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  deviceText: {
    flex: 1,
  },
  nodeTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deviceName: {
    fontSize: 11,
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    color: MounSilverTheme.colors.primary,
    letterSpacing: 1,
  },
  deviceNameActive: {
    color: 'white',
  },
  activePill: {
    backgroundColor: '#10b981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pillText: {
    fontSize: 6,
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    color: 'white',
  },
  deviceMac: {
    fontSize: 9,
    color: '#8e8e8e',
    marginTop: 2,
  },
  linkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'transparent',
  },
  terminalCard: {
    backgroundColor: MounSilverTheme.colors.primary,
    borderRadius: 24,
    padding: 20,
    height: 256,
    borderWidth: 1,
    borderColor: '#32353d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  terminalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  statusDotTerminal: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3f3f46',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  terminalListContainer: {
    flex: 1,
  },
  logLine: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  logTime: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#52525b',
    marginRight: 8,
  },
  logMsg: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#a1a1aa',
    flex: 1,
  },
  logSent: {
    color: '#ffffff',
  },
  logRcvd: {
    color: '#d1d5db',
  },
  logError: {
    color: MounSilverTheme.colors.error,
  },
  terminalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  prompt: {
    color: '#52525b',
    fontFamily: 'monospace',
    fontSize: 9,
  },
  terminalInput: {
    flex: 1,
    color: 'white',
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 2,
    padding: 0,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 8,
    color: '#8e8e8e',
    fontFamily: MounSilverTheme.typography.fontFamily.bold,
    letterSpacing: 2,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 11,
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    letterSpacing: 1,
    color: MounSilverTheme.colors.primary,
  },
  bottomSpacer: {
    height: 40,
  },
  linkButton: {
    marginTop: 16,
    backgroundColor: MounSilverTheme.colors.primary,
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  linkButtonDisabled: {
    backgroundColor: '#10b981',
    opacity: 0.8,
  },
  linkButtonText: {
    color: 'white',
    fontSize: 11,
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
