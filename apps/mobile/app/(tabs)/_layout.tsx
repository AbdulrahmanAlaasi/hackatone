import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { Icon } from '../../src/components/Icon';
import { tokens } from '../../src/theme';

function TabIcon({
  icon: IconCmp,
  label,
  focused,
}: {
  icon: (p: { size?: number; color?: string }) => JSX.Element;
  label: string;
  focused: boolean;
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: tokens.radius.full,
        backgroundColor: focused ? tokens.color.surfaceSoft : 'transparent',
        minWidth: 78,
      }}
    >
      <IconCmp size={20} color={focused ? tokens.color.primaryPressed : tokens.color.textMuted} />
      <Text
        style={{
          fontSize: 10,
          fontWeight: '800',
          color: focused ? tokens.color.primaryPressed : tokens.color.textMuted,
          marginTop: 4,
          letterSpacing: 0.4,
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
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon={Icon.Home} label="HOME" focused={focused} /> }}
      />
      <Tabs.Screen
        name="qr"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon={Icon.QrCode} label="QR" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon={Icon.User} label="PROFILE" focused={focused} /> }}
      />
    </Tabs>
  );
}
