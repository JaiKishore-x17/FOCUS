import { View, Text, StyleSheet } from 'react-native';
import { MounSilverTheme } from '../../src/theme/theme';

export default function ConnectScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CONNECT</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MounSilverTheme.colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: MounSilverTheme.typography.fontFamily.light,
    fontSize: 60,
    letterSpacing: 15,
    color: MounSilverTheme.colors.primary,
  },
});
