import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MounSilverTheme } from '../../src/theme/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="monitor"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIndicator]}>
              <MaterialIcons 
                name="videocam" 
                size={24} 
                color={focused ? MounSilverTheme.colors.primary : MounSilverTheme.colors.inactiveIcon} 
              />
              <Text style={[styles.label, focused && styles.activeLabel]}>MONITOR</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calibrate"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIndicator]}>
              <MaterialIcons 
                name="settings-accessibility" 
                size={24} 
                color={focused ? MounSilverTheme.colors.primary : MounSilverTheme.colors.inactiveIcon} 
              />
              <Text style={[styles.label, focused && styles.activeLabel]}>CALIBRATE</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIndicator]}>
              <MaterialIcons 
                name="bluetooth" 
                size={24} 
                color={focused ? MounSilverTheme.colors.primary : MounSilverTheme.colors.inactiveIcon} 
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
    bottom: 0,
    backgroundColor: MounSilverTheme.colors.glassBase,
    height: 90,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    elevation: 0,
    shadowColor: 'transparent',
    paddingBottom: 20,
    paddingTop: 10,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  activeIndicator: {
    backgroundColor: MounSilverTheme.colors.activeIndicator,
  },
  label: {
    fontFamily: MounSilverTheme.typography.fontFamily.extrabold,
    fontSize: 8,
    letterSpacing: 2,
    marginTop: 4,
    color: MounSilverTheme.colors.inactiveIcon,
  },
  activeLabel: {
    color: MounSilverTheme.colors.primary,
  }
});
