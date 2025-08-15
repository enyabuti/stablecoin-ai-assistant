'use client';

import { useState, useEffect } from 'react';
import { FeatureFlags } from '@/lib/featureFlags';

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>({
    USE_MOCKS: true,
    ENABLE_CCTP: false,
    ENABLE_NOTIFICATIONS: false
  });
  
  const [loading, setLoading] = useState(true);

  // Load initial flags
  useEffect(() => {
    async function loadFlags() {
      try {
        const response = await fetch('/api/feature-flags');
        if (response.ok) {
          const data = await response.json();
          setFlags(data.flags);
        }
      } catch (error) {
        console.error('Failed to load feature flags:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadFlags();
  }, []);

  const updateFlag = async <K extends keyof FeatureFlags>(
    flag: K,
    value: FeatureFlags[K]
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/feature-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ flag, value })
      });

      if (response.ok) {
        const data = await response.json();
        setFlags(data.flags);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update feature flag:', error);
      return false;
    }
  };

  return {
    flags,
    loading,
    updateFlag
  };
}