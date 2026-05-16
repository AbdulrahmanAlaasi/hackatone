import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '../src/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hackatone</Text>
      <Text style={styles.subtitle}>Participant app scaffold. Screens land in prompts 7–11.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.space[6],
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: tokens.color.text,
    marginBottom: tokens.space[2],
  },
  subtitle: {
    fontSize: 15,
    color: tokens.color.textMuted,
    textAlign: 'center',
  },
});
