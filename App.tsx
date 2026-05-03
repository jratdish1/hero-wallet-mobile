import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { WalletProvider } from './src/contexts/WalletContext';
import { GameProvider } from './src/contexts/GameContext';
import WalletScreen from './src/screens/WalletScreen';
import SwapScreen from './src/screens/SwapScreen';
import MissionsScreen from './src/screens/MissionsScreen';
import RankScreen from './src/screens/RankScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    'Wallet': '💰',
    'Swap': '⇄',
    'Missions': '🎯',
    'Rank': '🎖️',
    'Settings': '⚙️',
  };
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={[styles.tabIconText, focused && styles.tabIconTextActive]}>
        {icons[name] || '•'}
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <GameProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: styles.tabBar,
              tabBarActiveTintColor: '#c8a55a',
              tabBarInactiveTintColor: '#666',
              tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
              tabBarLabelStyle: styles.tabLabel,
            })}
          >
            <Tab.Screen name="Wallet" component={WalletScreen} />
            <Tab.Screen name="Swap" component={SwapScreen} />
            <Tab.Screen name="Missions" component={MissionsScreen} />
            <Tab.Screen name="Rank" component={RankScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </GameProvider>
    </WalletProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0d1117',
    borderTopColor: '#1a2332',
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tabIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: 'rgba(200, 165, 90, 0.15)',
  },
  tabIconText: {
    fontSize: 18,
  },
  tabIconTextActive: {
    fontSize: 20,
  },
});
