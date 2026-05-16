import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { tokens } from '../../src/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: tokens.radius.full,
        backgroundColor: focused ? tokens.color.surfaceSoft : 'transparent',
        minWidth: 72,
      }}
    >
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: 10,
          fontWeight: '800',
          color: focused ? tokens.color.primaryPressed : tokens.color.textMuted,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: tokens.color.surface,
          borderTopWidth: 0,
          height: 78,
          paddingTop: 8,
          paddingBottom: 18,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="qr"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📱" label="QR" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }}
      />
    </Tabs>
  );
}
