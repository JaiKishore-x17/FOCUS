import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { MounSilverTheme } from '../../src/theme/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: MounSilverTheme.colors.primary,
        tabBarInactiveTintColor: MounSilverTheme.colors.inactiveIcon,
      }}>
      <Tabs.Screen
        name="monitor"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.activeIndicator]}>
              <MaterialIcons 
                name="videocam" 
                size={22} 
                color={color} 
                style={focused ? styles.activeIcon : {}}
              />
              <Text style={[styles.label, focused && styles.activeLabel]}>MONITOR</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calibrate"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.activeIndicator]}>
              <MaterialIcons 
                name="tune" 
                size={22} 
                color={color} 
                style={focused ? styles.activeIcon : {}}
              />
              <Text style={[styles.label, focused && styles.activeLabel]}>SENSE</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.activeIndicator]}>
              <MaterialIcons 
                name="bluetooth" 
                size={22} 
                color={color} 
                style={focused ? styles.activeIcon : {}}
              />
              <Text style={[styles.label, focused && styles.activeLabel]}>CONNECT</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    height: 70,
    borderRadius: 35,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    paddingHorizontal: 12,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: 80,
    borderRadius: 25,
    marginTop: 25,
  },
  activeIndicator: {
    backgroundColor: '#f4f4f5',
  },
  activeIcon: {
    transform: [{ scale: 1.1 }],
  },
  label: {
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    fontSize: 7,
    letterSpacing: 2,
    marginTop: 2,
    color: MounSilverTheme.colors.inactiveIcon,
  },
  activeLabel: {
    color: MounSilverTheme.colors.primary,
  }
});
