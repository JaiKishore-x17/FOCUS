import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MounSilverTheme } from '../../src/theme/theme';
import { useFocusGuard } from '../../src/hooks/useFocusGuard';

const JOYSTICK_SIZE = 112; // 28 * 4
const KNOB_SIZE = 40; // 10 * 4
const MAX_DISTANCE = (JOYSTICK_SIZE - KNOB_SIZE) / 2;

export default function CalibrateScreen() {
  const [panValue, setPanValue] = useState(0);
  const [tiltValue, setTiltValue] = useState(0);

  const panAnim = useRef(new Animated.Value(0)).current;
  const tiltAnim = useRef(new Animated.Value(0)).current;

  const { sendUpdate, commit } = useFocusGuard();

  // Track values for display and logic
  useEffect(() => {
    const panId = panAnim.addListener(({ value }) => {
      const scaled = Number(((value / MAX_DISTANCE) * 5).toFixed(2));
      setPanValue(scaled);
      
      // Send to ESP32: Map -MAX_DISTANCE...MAX_DISTANCE to 0...180
      const servoVal = Math.round(((value + MAX_DISTANCE) / (2 * MAX_DISTANCE)) * 180);
      sendUpdate(servoVal);
    });
    const tiltId = tiltAnim.addListener(({ value }) => {
      const scaled = Number(((value / MAX_DISTANCE) * 5).toFixed(2));
      setTiltValue(scaled);

      const servoVal = Math.round(((value + MAX_DISTANCE) / (2 * MAX_DISTANCE)) * 180);
      sendUpdate(undefined, servoVal);
    });
    return () => {
      panAnim.removeListener(panId);
      tiltAnim.removeListener(tiltId);
    };
  }, [sendUpdate]);

  const resetValues = () => {
    Animated.parallel([
      Animated.spring(panAnim, { toValue: 0, useNativeDriver: true, tension: 50, friction: 7 }),
      Animated.spring(tiltAnim, { toValue: 0, useNativeDriver: true, tension: 50, friction: 7 }),
    ]).start();
  };

  // Pan Responder for Horizontal Joystick
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        let dx = gestureState.dx;
        // Constrain to MAX_DISTANCE
        if (dx > MAX_DISTANCE) dx = MAX_DISTANCE;
        if (dx < -MAX_DISTANCE) dx = -MAX_DISTANCE;
        panAnim.setValue(dx);
      },
      onPanResponderRelease: () => {
        // Option: Snap back or stay? 
        // HTML says "drag_pan" usually implies it stays, but calibration often snaps to 0 if released?
        // User said "track touch input and update coordinates", I'll keep it where it is unless reset.
        // But traditional joysticks snap back. I'll make it snap back to match "joystick" behavior, 
        // but since it updates offset markers, maybe it should stay?
        // Actually, looking at the HTML, it's a "calibration" so these might be "nudges".
        // I'll make it stay for precise calibration.
      },
    })
  ).current;

  // Pan Responder for Vertical Joystick
  const tiltResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        let dy = gestureState.dy;
        if (dy > MAX_DISTANCE) dy = MAX_DISTANCE;
        if (dy < -MAX_DISTANCE) dy = -MAX_DISTANCE;
        tiltAnim.setValue(dy);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <MaterialIcons name="security" size={24} color={MounSilverTheme.colors.primary} />
          <Text style={styles.headerTitle}>FOCUS</Text>
        </View>
        <View style={styles.headerNav}>
          <Text style={styles.headerNavLink}>CALIBRATE</Text>
          <View style={styles.avatarPlaceholder} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* System State Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBackground} />
          <View style={styles.heroCard}>
            <View>
              <Text style={styles.heroLabel}>SYSTEM STATE</Text>
              <Text style={styles.heroTitle}>CALIBRATION</Text>
            </View>
            <Pressable 
                style={styles.saveButton} 
                android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
                onPress={commit}
            >
              <Text style={styles.saveButtonText}>SAVE PARAMETERS</Text>
            </Pressable>
          </View>
        </View>

        {/* Joysticks Section */}
        <View style={styles.joystickGrid}>
          {/* Pan Control */}
          <View style={styles.joystickCard}>
            <Text style={styles.joystickLabel}>SERVO_PAN</Text>
            <View style={styles.joystickBase}>
                <View style={styles.guideLineH} />
                <View style={styles.guideLineV} />
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                        styles.joystickKnob,
                        { transform: [{ translateX: panAnim }] }
                    ]}
                >
                    <MaterialIcons name="open-with" size={16} color="white" />
                </Animated.View>
            </View>
          </View>

          {/* Tilt Control */}
          <View style={styles.joystickCard}>
            <Text style={[styles.joystickLabel, { textAlign: 'right' }]}>SERVO_TILT</Text>
            <View style={styles.joystickBase}>
                <View style={styles.guideLineH} />
                <View style={styles.guideLineV} />
                <Animated.View
                    {...tiltResponder.panHandlers}
                    style={[
                        styles.joystickKnob,
                        { transform: [{ translateY: tiltAnim }] }
                    ]}
                >
                    <MaterialIcons name="unfold-more" size={16} color="white" />
                </Animated.View>
            </View>
          </View>
        </View>

        {/* Center Reset */}
        <View style={styles.centerContainer}>
          <Pressable 
            style={styles.centerButton} 
            onPress={resetValues}
            android_ripple={{ color: 'rgba(17,19,24,0.1)', borderless: true }}
          >
            <MaterialIcons name="restart-alt" size={18} color={MounSilverTheme.colors.primary} />
            <Text style={styles.centerButtonText}>CENTER</Text>
          </Pressable>
        </View>

        {/* Offset Markers */}
        <View style={styles.offsetSection}>
          <Text style={styles.sectionLabel}>OFFSET_MARKERS</Text>
          <View style={styles.offsetGrid}>
            <View style={styles.offsetField}>
              <Text style={styles.fieldLabel}>TRIM_HORIZ</Text>
              <View style={styles.fieldValueContainer}>
                <Text style={styles.fieldValue}>{panValue > 0 ? '+' : ''}{panValue.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.offsetField}>
              <Text style={styles.fieldLabel}>TRIM_VERT</Text>
              <View style={styles.fieldValueContainer}>
                <Text style={styles.fieldValue}>{tiltValue > 0 ? '+' : ''}{tiltValue.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* System Hint */}
        <View style={styles.hintCard}>
          <View style={styles.hintHeader}>
            <MaterialIcons name="info" size={16} color="white" style={{ opacity: 0.7 }} />
            <Text style={styles.hintLabel}>SYSTEM_HINT</Text>
          </View>
          <Text style={styles.hintText}>
            ENSURE HARDWARE IS ON A LEVEL SURFACE. MANUAL OVERRIDES DISENGAGE SENSORS.
          </Text>
        </View>

        {/* Board Area */}
        <View style={styles.boardCard}>
          <View style={styles.boardHeader}>
            <Text style={styles.sectionLabel}>BOARD_AREA</Text>
            <View style={styles.boardActions}>
                <Pressable style={styles.boardBtn}><Text style={styles.boardBtnText}>BOUNDS</Text></Pressable>
                <Pressable 
                    style={[styles.boardBtn, styles.boardBtnPrimary]}
                    onPress={commit}
                >
                    <Text style={[styles.boardBtnText, { color: 'white' }]}>COMMIT</Text>
                </Pressable>
            </View>
          </View>
          <View style={styles.boardView}>
            <View style={styles.boardOverlay}>
                <View style={styles.boardZone}>
                    <View style={[styles.corner, { top: -4, left: -4 }]} />
                    <View style={[styles.corner, { top: -4, right: -4 }]} />
                    <View style={[styles.corner, { bottom: -4, left: -4 }]} />
                    <View style={[styles.corner, { bottom: -4, right: -4 }]} />
                    <Text style={styles.zoneText}>ZONE_ACTIVE</Text>
                </View>
            </View>
            <View style={styles.dataOverlay}>
                <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>X</Text>
                    <Text style={styles.dataValue}>{(192.4 + panValue * 10).toFixed(1)}</Text>
                </View>
                <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Y</Text>
                    <Text style={styles.dataValue}>{(84.2 + tiltValue * 10).toFixed(1)}</Text>
                </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: MounSilverTheme.colors.activeIndicator,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 100,
  },
  heroSection: {
    marginBottom: 32,
    position: 'relative',
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(233, 236, 239, 0.2)',
    borderRadius: 12,
    transform: [{ rotate: '-1.5deg' }, { translateX: -4 }, { translateY: 2 }],
    zIndex: -1,
  },
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 16,
  },
  heroLabel: {
    fontSize: 8,
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    letterSpacing: 4,
    color: MounSilverTheme.colors.primary,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: MounSilverTheme.typography.fontFamily.light,
    letterSpacing: 4,
    color: MounSilverTheme.colors.primary,
  },
  saveButton: {
    backgroundColor: MounSilverTheme.colors.primary,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    fontSize: 9,
    letterSpacing: 2,
  },
  joystickGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  joystickCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  joystickLabel: {
    fontSize: 8,
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    letterSpacing: 3,
    color: '#8e8e8e',
    marginBottom: 16,
    width: '100%',
  },
  joystickBase: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    backgroundColor: 'rgba(241, 243, 245, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    // Inner shadow simulation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  guideLineH: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(17, 19, 24, 0.05)',
  },
  guideLineV: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(17, 19, 24, 0.05)',
  },
  joystickKnob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: '#8e8e8e',
    alignItems: 'center',
    justifyContent: 'center',
    // Gradient simulation
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  centerContainer: {
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 24,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  centerButtonText: {
    fontSize: 7,
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    letterSpacing: 2,
    color: MounSilverTheme.colors.primary,
    marginTop: 2,
  },
  offsetSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    letterSpacing: 2,
    color: MounSilverTheme.colors.primary,
    marginBottom: 20,
  },
  offsetGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  offsetField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 7,
    fontFamily: MounSilverTheme.typography.fontFamily.medium,
    letterSpacing: 2,
    color: '#8e8e8e',
    marginBottom: 6,
  },
  fieldValueContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  fieldValue: {
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 1,
    color: MounSilverTheme.colors.primary,
  },
  hintCard: {
    backgroundColor: MounSilverTheme.colors.primary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  hintLabel: {
    fontSize: 8,
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    letterSpacing: 2,
    color: 'white',
  },
  hintText: {
    fontSize: 9,
    fontFamily: MounSilverTheme.typography.fontFamily.regular,
    color: 'white',
    opacity: 0.7,
    lineHeight: 14,
    letterSpacing: 1,
  },
  boardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  boardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  boardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  boardBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f3f5',
    borderRadius: 6,
  },
  boardBtnPrimary: {
    backgroundColor: MounSilverTheme.colors.primary,
  },
  boardBtnText: {
    fontSize: 7,
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    letterSpacing: 1,
    color: MounSilverTheme.colors.primary,
  },
  boardView: {
    aspectRatio: 16 / 9,
    width: '100%',
    backgroundColor: '#18181b',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  boardOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardZone: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  zoneText: {
    fontSize: 7,
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    letterSpacing: 4,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  dataOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dataRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dataLabel: {
    fontSize: 6,
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: MounSilverTheme.typography.fontFamily.bold,
  },
  dataValue: {
    fontSize: 6,
    color: 'white',
    fontFamily: 'monospace',
  },
  bottomSpacer: {
    height: 40,
  },
});
