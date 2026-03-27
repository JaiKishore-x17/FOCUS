import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Animated, Easing, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MounSilverTheme } from '../../src/theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusGuard } from '../../src/hooks/useFocusGuard';

const { width, height } = Dimensions.get('window');

export default function MonitorScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanlineAnim = useRef(new Animated.Value(0)).current;
  const { sendUpdate, systemState } = useFocusGuard();
  const [isLaserOn, setIsLaserOn] = React.useState(systemState.laser === 1);

  // Sync with global state
  useEffect(() => {
    setIsLaserOn(systemState.laser === 1);
  }, [systemState.laser]);

  useEffect(() => {
    // Pulse animation for button
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Scanline animation for camera feed
    const scanline = Animated.loop(
      Animated.timing(scanlineAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    pulse.start();
    scanline.start();

    return () => {
      pulse.stop();
      scanline.stop();
    };
  }, [pulseAnim, scanlineAnim]);

  const scanlineTranslateY = scanlineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 320], // Assuming box is ~320px high
  });

  const toggleLaser = () => {
    const newState = !isLaserOn;
    setIsLaserOn(newState);
    sendUpdate(undefined, undefined, newState ? 1 : 0);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <MaterialIcons name="security" size={24} color={MounSilverTheme.colors.primary} />
          <Text style={styles.headerTitle}>FOCUS</Text>
        </View>
        <View style={styles.headerNav}>
          <Text style={styles.headerNavLink}>MONITOR</Text>
          <View style={styles.avatarPlaceholder} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section: Monitoring Canvas */}
        <View style={styles.heroSection}>
          <View style={styles.heroBackground} />
          <View style={styles.cameraBox}>
            {/* Simulated Grid Overlay */}
            <View style={styles.gridOverlay} />
            
            
            <View style={styles.hudTopLeft}>
              <View style={styles.badgeLive}>
                <View style={[styles.pulseDot, { backgroundColor: '#22c55e' }]} />
                <Text style={styles.badgeLiveText}>LIVE</Text>
              </View>
              <View style={styles.badgeFov}>
                <Text style={styles.badgeFovText}>FOV: 114.2°</Text>
              </View>
            </View>

            <View style={styles.hudBottomRight}>
              
              <View style={styles.badgeXy}>
                <Text style={styles.badgeXyText}>XY: 142.02 / 092.41</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>POPULATION</Text>
            <View>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statSubText}>DETECTED</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statLabel, { color: MounSilverTheme.colors.error }]}>DISTRACTED</Text>
            <View>
              <Text style={[styles.statNumber, { color: MounSilverTheme.colors.error }]}>03</Text>
              <Text style={styles.statSubText}>ALERTS</Text>
            </View>
          </View>
        </View>

        {/* Processor block */}
        <View style={styles.processorCard}>
          <View style={styles.processorCol}>
            <Text style={styles.processorLabel}>PROCESSOR</Text>
            <Text style={styles.processorValue}>
              12<Text style={styles.processorUnit}>ms</Text>
            </Text>
          </View>
          <Text style={styles.processorSubText}>SYSTEM PULSE</Text>
        </View>

        {/* Hardware Controls */}
        <View style={styles.hardwareControlsContainer}>
          <View style={styles.hardwareHeader}>
            <Text style={styles.hardwareTitle}>HARDWARE_OVERRIDE</Text>
            <Text style={styles.hardwareSubTitle}>PHOTO-THERMAL STIMULUS</Text>
          </View>

          {/* START Button */}
          <Animated.View style={[styles.startButtonOuter, { transform: [{ scale: pulseAnim }], opacity: isLaserOn ? 0.8 : 1 }]}>
            <Pressable 
                style={styles.startButtonInner} 
                onPress={toggleLaser}
                android_ripple={{ color: 'rgba(17, 19, 24, 0.1)', borderless: true }}
            >
              <MaterialIcons 
                name={isLaserOn ? "flash-on" : "settings-accessibility"} 
                size={32} 
                color={isLaserOn ? "#ef4444" : MounSilverTheme.colors.primary} 
              />
              <Text style={[styles.startButtonText, isLaserOn && { color: '#ef4444' }]}>
                {isLaserOn ? 'STOP' : 'START'}
              </Text>
            </Pressable>
          </Animated.View>

          <View style={styles.hardwareFooter}>
            <Text style={styles.hardwareFooterBtn}>SAFETY</Text>
            <View style={styles.hardwareDivider} />
            <Text style={styles.hardwareFooterBtn}>MANUAL</Text>
          </View>
        </View>

        {/* Extra space at bottom for Tab Bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // bg-background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
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
    fontSize: 12,
    letterSpacing: 3,
    color: MounSilverTheme.colors.primary,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerNavLink: {
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    fontSize: 10,
    letterSpacing: 1,
    color: MounSilverTheme.colors.primary,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MounSilverTheme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  heroSection: {
    height: 320,
    width: '100%',
    position: 'relative',
    marginBottom: 24,
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: MounSilverTheme.colors.surfaceContainerLow,
    borderRadius: 24,
    transform: [{ rotate: '0.2deg' }],
    opacity: 0.3,
  },
  cameraBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gridOverlay: {
    // simplified face-mesh-overlay from CSS
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  faceDetectA: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceLabelA: {
    position: 'absolute',
    top: -16,
    fontSize: 8,
    fontFamily: MounSilverTheme.typography.fontFamily.bold,
    color: '#22c55e',
    letterSpacing: 1,
  },
  faceDetectB: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceDetectBInner: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(186, 26, 26, 0.4)',
  },
  faceLabelB: {
    position: 'absolute',
    top: -16,
    fontSize: 8,
    fontFamily: MounSilverTheme.typography.fontFamily.bold,
    color: MounSilverTheme.colors.error,
    letterSpacing: 1,
  },
  scanline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  hudTopLeft: {
    position: 'absolute',
    top: 16,
    left: 16,
    gap: 8,
  },
  badgeLive: {
    backgroundColor: 'rgba(17,19,24,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeLiveText: {
    color: 'white',
    fontFamily: MounSilverTheme.typography.fontFamily.bold,
    fontSize: 9,
    letterSpacing: 2,
  },
  badgeFov: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeFovText: {
    color: 'white',
    fontFamily: MounSilverTheme.typography.fontFamily.bold,
    fontSize: 8,
    letterSpacing: 1,
  },
  hudBottomRight: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'flex-end',
    gap: 8,
  },
  targetLockedContainer: {
    alignItems: 'flex-end',
  },
  targetLockedText: {
    color: MounSilverTheme.colors.error,
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    fontSize: 12,
    letterSpacing: 2,
  },
  targetLockedLine: {
    height: 2,
    width: 64,
    backgroundColor: MounSilverTheme.colors.error,
    marginTop: 2,
  },
  badgeXy: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeXyText: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: MounSilverTheme.typography.fontFamily.regular,
    fontSize: 9,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: MounSilverTheme.colors.surfaceContainerLow,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: MounSilverTheme.colors.surfaceContainerLow,
    aspectRatio: 1,
    justifyContent: 'space-between',
  },
  statLabel: {
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    fontSize: 9,
    letterSpacing: 2,
    color: '#8e8e8e', // secondary
  },
  statNumber: {
    fontFamily: MounSilverTheme.typography.fontFamily.light,
    fontSize: 36,
    color: MounSilverTheme.colors.primary,
    marginBottom: 4,
  },
  statSubText: {
    fontFamily: MounSilverTheme.typography.fontFamily.medium,
    fontSize: 8,
    letterSpacing: 1,
    color: '#a1a1aa',
  },
  processorCard: {
    backgroundColor: MounSilverTheme.colors.primary,
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  processorCol: {
    flexDirection: 'column',
  },
  processorLabel: {
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    fontSize: 9,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.4)',
  },
  processorValue: {
    fontFamily: MounSilverTheme.typography.fontFamily.light,
    fontSize: 30,
    color: 'white',
    marginTop: 4,
  },
  processorUnit: {
    fontSize: 14,
  },
  processorSubText: {
    fontFamily: MounSilverTheme.typography.fontFamily.medium,
    fontSize: 8,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.4)',
  },
  hardwareControlsContainer: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    gap: 24,
  },
  hardwareHeader: {
    alignItems: 'center',
  },
  hardwareTitle: {
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    fontSize: 10,
    letterSpacing: 3,
    color: MounSilverTheme.colors.primary,
  },
  hardwareSubTitle: {
    fontFamily: MounSilverTheme.typography.fontFamily.light,
    fontSize: 9,
    letterSpacing: 2,
    color: MounSilverTheme.colors.inactiveIcon,
    marginTop: 4,
  },
  startButtonOuter: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: MounSilverTheme.colors.secondary, // simplified metallic gradient
    padding: 4,
  },
  startButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  startButtonText: {
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    fontSize: 10,
    letterSpacing: 2,
    color: MounSilverTheme.colors.primary,
  },
  hardwareFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 16,
    gap: 24,
  },
  hardwareFooterBtn: {
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    fontSize: 9,
    letterSpacing: 2,
    color: 'rgba(17,19,24,0.4)',
  },
  hardwareDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(17,19,24,0.1)',
  },
  bottomSpacer: {
    height: 100, // accommodate Absolute tab bar
  },
});
