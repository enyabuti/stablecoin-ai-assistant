export interface FeatureFlags {
  USE_MOCKS: boolean;
  ENABLE_CCTP: boolean;
  ENABLE_NOTIFICATIONS: boolean;
}

// Default flags for demo mode
const defaultFlags: FeatureFlags = {
  USE_MOCKS: true,
  ENABLE_CCTP: false,
  ENABLE_NOTIFICATIONS: false
};

// In-memory storage for demo (would be database/redis in production)
let currentFlags: FeatureFlags = { ...defaultFlags };

export function getFeatureFlags(): FeatureFlags {
  return { ...currentFlags };
}

export function updateFeatureFlag<K extends keyof FeatureFlags>(
  flag: K,
  value: FeatureFlags[K]
): FeatureFlags {
  currentFlags[flag] = value;
  return { ...currentFlags };
}

export function resetFeatureFlags(): FeatureFlags {
  currentFlags = { ...defaultFlags };
  return { ...currentFlags };
}

export function getAllFeatureFlags(): FeatureFlags {
  return getFeatureFlags();
}