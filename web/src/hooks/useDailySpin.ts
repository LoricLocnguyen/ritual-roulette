import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import dappsDataRaw from "@/data/ritual-dapp-list.json";

// Type definitions
export interface Creator {
  name: string;
  inferred_creator_handle: string | null;
  handle_verified: boolean;
  social_url: string | null;
}

export interface RitualStack {
  precompiles: string[];
  details: Record<string, string>;
}

export interface DApp {
  id: string;
  name: string;
  url: string;
  description: string;
  creator: Creator;
  ritual_stack: RitualStack;
  needs_review?: boolean;
  active: boolean;
}

export interface SpinRecord {
  dappId: string;
  name: string;
  timestamp: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  unlockedAt: number;
  icon: string;
}

const dappsData = dappsDataRaw as unknown as DApp[];

export function useDailySpin() {
  const { address } = useAccount();
  const userKey = address ? address.toLowerCase() : "anonymous";

  const [lastSpinTime, setLastSpinTime] = useState<number | null>(null);
  const [history, setHistory] = useState<SpinRecord[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [collection, setCollection] = useState<string[]>([]); // DApp IDs
  const [badges, setBadges] = useState<AchievementBadge[]>([]);

  // Load state from localStorage whenever userKey changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedLastSpin = localStorage.getItem(`rr_${userKey}_last_spin`);
      const savedHistory = localStorage.getItem(`rr_${userKey}_history`);
      const savedStreak = localStorage.getItem(`rr_${userKey}_streak`);
      const savedCollection = localStorage.getItem(`rr_${userKey}_collection`);
      const savedBadges = localStorage.getItem(`rr_${userKey}_badges`);

      setLastSpinTime(savedLastSpin ? parseInt(savedLastSpin, 10) : null);
      setHistory(savedHistory ? JSON.parse(savedHistory) : []);
      setStreak(savedStreak ? parseInt(savedStreak, 10) : 0);
      setCollection(savedCollection ? JSON.parse(savedCollection) : []);
      setBadges(savedBadges ? JSON.parse(savedBadges) : []);
    } catch (e) {
      console.error("Error loading daily spin storage:", e);
    }
  }, [userKey]);

  // Save state helpers
  const saveState = useCallback((
    newLastSpin: number | null,
    newHistory: SpinRecord[],
    newStreak: number,
    newCollection: string[],
    newBadges: AchievementBadge[]
  ) => {
    setLastSpinTime(newLastSpin);
    setHistory(newHistory);
    setStreak(newStreak);
    setCollection(newCollection);
    setBadges(newBadges);

    try {
      if (newLastSpin !== null) {
        localStorage.setItem(`rr_${userKey}_last_spin`, newLastSpin.toString());
      } else {
        localStorage.removeItem(`rr_${userKey}_last_spin`);
      }
      localStorage.setItem(`rr_${userKey}_history`, JSON.stringify(newHistory));
      localStorage.setItem(`rr_${userKey}_streak`, newStreak.toString());
      localStorage.setItem(`rr_${userKey}_collection`, JSON.stringify(newCollection));
      localStorage.setItem(`rr_${userKey}_badges`, JSON.stringify(newBadges));
    } catch (e) {
      console.error("Error saving daily spin storage:", e);
    }
  }, [userKey]);

  // Check if user is eligible to spin today
  const canSpin = useCallback((): boolean => {
    if (!lastSpinTime) return true;

    const now = new Date();
    const lastSpinDate = new Date(lastSpinTime);

    // Reset daily at local 00:00 midnight
    return (
      now.getFullYear() !== lastSpinDate.getFullYear() ||
      now.getMonth() !== lastSpinDate.getMonth() ||
      now.getDate() !== lastSpinDate.getDate()
    );
  }, [lastSpinTime]);

  const activeDApps = dappsData.filter((d) => d.active);

  // Unlocking badges algorithm
  const updateAvailableBadges = useCallback((
    curCollection: string[],
    newHistory: SpinRecord[]
  ): AchievementBadge[] => {
    const unlocked: AchievementBadge[] = [...badges];
    const nowTime = Date.now();

    const addBadgeIfNew = (id: string, title: string, desc: string, icon: string) => {
      if (!unlocked.some((b) => b.id === id)) {
        unlocked.push({
          id,
          title,
          description: desc,
          unlockedAt: nowTime,
          icon,
        });
      }
    };

    // Calculate unique precompiles explored
    const exploredDApps = activeDApps.filter((d) => curCollection.includes(d.id));
    
    // Badge 1: First spin
    if (curCollection.length >= 1) {
      addBadgeIfNew("first_spin", "Ritual Initiate", "Spun the wheel for the first time!", "🎯");
    }

    // Badge 2: LLM Explorer (Spun 3 LLM precompiler dApps)
    const llmCount = exploredDApps.filter((d) => 
      d.ritual_stack.precompiles.includes("0x0802")
    ).length;
    if (llmCount >= 3) {
      addBadgeIfNew("llm_pioneer", "LLM Pioneer", "Explored 3 dApps integrated with LLM precompiles.", "🤖");
    }

    // Badge 3: Multimodal Visionary (Spun 3 image precompiles)
    const mediaCount = exploredDApps.filter((d) => 
      d.ritual_stack.precompiles.includes("0x0818")
    ).length;
    if (mediaCount >= 2) {
      addBadgeIfNew("multimodal", "Multimodal Architect", "Explored 2 media/NFT signature generators.", "🎨");
    }

    // Badge 4: Deep Explorer (Explore 10 dApps overall)
    if (curCollection.length >= 10) {
      addBadgeIfNew("explorer_10", "Cosmic Voyager", "Discovered 10 unique dApps inside the Ritual ecosystem.", "🌌");
    }

    // Badge 5: Streak badges (e.g. 3-day streak)
    if (streak >= 3) {
      addBadgeIfNew("streak_3", "Committed Ritualist", "Maintained a 3-day spin streak.", "🔥");
    }

    return unlocked;
  }, [badges, streak]);

  // Pre-pick a dApp from the full pool (used by SpinWheel to pre-determine the result)
  const pickDailyDApp = useCallback((): DApp => {
    const recentIds = history.slice(-5).map((r: SpinRecord) => r.dappId);
    let pool = activeDApps.filter((d) => !recentIds.includes(d.id));
    if (pool.length === 0) pool = activeDApps;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }, [history, activeDApps]);

  // Execute spin action — accepts the pre-chosen dApp so visual wheel matches recorded result
  const executeSpin = useCallback((preSelectedDApp?: DApp): DApp => {
    // Use the pre-selected dApp from the wheel, or pick one now as fallback
    const selectedDApp = preSelectedDApp ?? pickDailyDApp();

    // Compute new streak
    let newStreak = streak;
    const now = new Date();
    
    if (lastSpinTime) {
      const lastSpinDate = new Date(lastSpinTime);
      const diffTime = Math.abs(now.getTime() - lastSpinDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const isYesterday = (
        (now.getDate() - lastSpinDate.getDate() === 1 && now.getMonth() === lastSpinDate.getMonth()) ||
        (diffDays === 1)
      );

      if (isYesterday) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const nextSpinTime = now.getTime();
    const nextHistory = [...history, { dappId: selectedDApp.id, name: selectedDApp.name, timestamp: nextSpinTime }];
    const nextCollection = collection.includes(selectedDApp.id) 
      ? collection 
      : [...collection, selectedDApp.id];

    const nextBadges = updateAvailableBadges(nextCollection, nextHistory);
    saveState(nextSpinTime, nextHistory, newStreak, nextCollection, nextBadges);

    return selectedDApp;
  }, [history, streak, collection, lastSpinTime, pickDailyDApp, updateAvailableBadges, saveState]);

  return {
    canSpin: canSpin(),
    lastSpinTime,
    history,
    streak,
    collection,
    badges,
    executeSpin,
    pickDailyDApp,
    allDApps: dappsData,
    activeDApps,
  };
}
