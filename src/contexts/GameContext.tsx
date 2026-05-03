import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  type: 'daily' | 'weekly' | 'achievement';
  completed: boolean;
  icon: string;
  progress: number;
  target: number;
}

export interface Rank {
  level: number;
  title: string;
  minXP: number;
  badge: string;
}

const RANKS: Rank[] = [
  { level: 1, title: 'Recruit', minXP: 0, badge: '🪖' },
  { level: 2, title: 'Private', minXP: 100, badge: '⭐' },
  { level: 3, title: 'Corporal', minXP: 300, badge: '⭐⭐' },
  { level: 4, title: 'Sergeant', minXP: 600, badge: '🎖️' },
  { level: 5, title: 'Staff Sergeant', minXP: 1000, badge: '🎖️⭐' },
  { level: 6, title: 'Gunnery Sergeant', minXP: 1500, badge: '🎖️🎖️' },
  { level: 7, title: 'Master Sergeant', minXP: 2500, badge: '🏅' },
  { level: 8, title: 'First Sergeant', minXP: 4000, badge: '🏅⭐' },
  { level: 9, title: 'Sergeant Major', minXP: 6000, badge: '🏅🏅' },
  { level: 10, title: 'General', minXP: 10000, badge: '🫡' },
];

const DAILY_MISSIONS: Omit<Mission, 'completed' | 'progress'>[] = [
  { id: 'daily_login', title: 'Daily Check-In', description: 'Open the app today', xpReward: 10, type: 'daily', icon: '📱', target: 1 },
  { id: 'daily_swap', title: 'Make a Swap', description: 'Execute any swap transaction', xpReward: 25, type: 'daily', icon: '⇄', target: 1 },
  { id: 'daily_price_check', title: 'Price Patrol', description: 'Check HERO price 3 times', xpReward: 15, type: 'daily', icon: '📊', target: 3 },
  { id: 'daily_share', title: 'Spread the Word', description: 'Share HERO with a friend', xpReward: 20, type: 'daily', icon: '📣', target: 1 },
];

const WEEKLY_MISSIONS: Omit<Mission, 'completed' | 'progress'>[] = [
  { id: 'weekly_5_swaps', title: 'Swap Master', description: 'Complete 5 swaps this week', xpReward: 100, type: 'weekly', icon: '🔥', target: 5 },
  { id: 'weekly_stake', title: 'Diamond Hands', description: 'Stake any amount of HERO', xpReward: 75, type: 'weekly', icon: '💎', target: 1 },
  { id: 'weekly_burn', title: 'Burn Baby Burn', description: 'Contribute to Buy & Burn', xpReward: 150, type: 'weekly', icon: '🔥', target: 1 },
];

const ACHIEVEMENTS: Omit<Mission, 'completed' | 'progress'>[] = [
  { id: 'ach_first_swap', title: 'First Blood', description: 'Complete your first swap', xpReward: 50, type: 'achievement', icon: '⚔️', target: 1 },
  { id: 'ach_10k_hero', title: 'HERO Whale', description: 'Hold 10,000+ HERO', xpReward: 200, type: 'achievement', icon: '🐋', target: 1 },
  { id: 'ach_streak_7', title: 'Week Warrior', description: '7-day login streak', xpReward: 100, type: 'achievement', icon: '🔥', target: 7 },
  { id: 'ach_streak_30', title: 'Iron Will', description: '30-day login streak', xpReward: 500, type: 'achievement', icon: '💪', target: 30 },
  { id: 'ach_all_chains', title: 'Chain Hopper', description: 'Use both PulseChain and Base', xpReward: 75, type: 'achievement', icon: '🌉', target: 2 },
];

interface GameState {
  xp: number;
  streak: number;
  lastLogin: string | null;
  missions: Mission[];
  rank: Rank;
  nextRank: Rank | null;
  xpToNextRank: number;
  addXP: (amount: number, reason: string) => void;
  completeMission: (missionId: string) => void;
  progressMission: (missionId: string, amount?: number) => void;
}

const GameContext = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [xpLog, setXPLog] = useState<{ amount: number; reason: string; time: string }[]>([]);

  // Calculate rank
  const rank = [...RANKS].reverse().find(r => xp >= r.minXP) || RANKS[0];
  const nextRank = RANKS[RANKS.indexOf(rank) + 1] || null;
  const xpToNextRank = nextRank ? nextRank.minXP - xp : 0;

  useEffect(() => {
    loadGameState();
  }, []);

  useEffect(() => {
    checkDailyLogin();
  }, [lastLogin]);

  async function loadGameState() {
    try {
      const saved = await AsyncStorage.getItem('hero_game_state');
      if (saved) {
        const state = JSON.parse(saved);
        setXP(state.xp || 0);
        setStreak(state.streak || 0);
        setLastLogin(state.lastLogin || null);
      }
      initMissions();
    } catch (e) {
      initMissions();
    }
  }

  function initMissions() {
    const allMissions: Mission[] = [
      ...DAILY_MISSIONS.map(m => ({ ...m, completed: false, progress: 0 })),
      ...WEEKLY_MISSIONS.map(m => ({ ...m, completed: false, progress: 0 })),
      ...ACHIEVEMENTS.map(m => ({ ...m, completed: false, progress: 0 })),
    ];
    setMissions(allMissions);
  }

  async function saveGameState(newXP: number, newStreak: number, newLastLogin: string | null) {
    try {
      await AsyncStorage.setItem('hero_game_state', JSON.stringify({
        xp: newXP,
        streak: newStreak,
        lastLogin: newLastLogin,
      }));
    } catch (e) {}
  }

  function checkDailyLogin() {
    const today = new Date().toISOString().split('T')[0];
    if (lastLogin !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newStreak = lastLogin === yesterday ? streak + 1 : 1;
      setStreak(newStreak);
      setLastLogin(today);
      saveGameState(xp, newStreak, today);
      // Auto-complete daily login mission
      progressMission('daily_login');
    }
  }

  function addXP(amount: number, reason: string) {
    const newXP = xp + amount;
    setXP(newXP);
    setXPLog(prev => [...prev, { amount, reason, time: new Date().toISOString() }]);
    saveGameState(newXP, streak, lastLogin);
  }

  function completeMission(missionId: string) {
    setMissions(prev => prev.map(m => {
      if (m.id === missionId && !m.completed) {
        addXP(m.xpReward, `Mission: ${m.title}`);
        return { ...m, completed: true, progress: m.target };
      }
      return m;
    }));
  }

  function progressMission(missionId: string, amount: number = 1) {
    setMissions(prev => prev.map(m => {
      if (m.id === missionId && !m.completed) {
        const newProgress = Math.min(m.progress + amount, m.target);
        if (newProgress >= m.target) {
          addXP(m.xpReward, `Mission: ${m.title}`);
          return { ...m, completed: true, progress: newProgress };
        }
        return { ...m, progress: newProgress };
      }
      return m;
    }));
  }

  return (
    <GameContext.Provider value={{
      xp, streak, lastLogin, missions, rank, nextRank, xpToNextRank,
      addXP, completeMission, progressMission,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
