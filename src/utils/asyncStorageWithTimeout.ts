import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Wrapper around AsyncStorage operations with timeout protection.
 * Prevents operations from hanging indefinitely on slow devices.
 */

const DEFAULT_TIMEOUT_MS = 5000; // 5 seconds

/**
 * Wraps a promise with a timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`AsyncStorage operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Get item from AsyncStorage with timeout
 */
export async function getItemWithTimeout(
  key: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<string | null> {
  try {
    return await withTimeout(AsyncStorage.getItem(key), timeoutMs);
  } catch (error) {
    console.error(`Failed to get AsyncStorage key "${key}":`, error);
    throw error;
  }
}

/**
 * Set item in AsyncStorage with timeout
 */
export async function setItemWithTimeout(
  key: string,
  value: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<void> {
  try {
    await withTimeout(AsyncStorage.setItem(key, value), timeoutMs);
  } catch (error) {
    console.error(`Failed to set AsyncStorage key "${key}":`, error);
    throw error;
  }
}

/**
 * Remove item from AsyncStorage with timeout
 */
export async function removeItemWithTimeout(
  key: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<void> {
  try {
    await withTimeout(AsyncStorage.removeItem(key), timeoutMs);
  } catch (error) {
    console.error(`Failed to remove AsyncStorage key "${key}":`, error);
    throw error;
  }
}

/**
 * Multi-get from AsyncStorage with timeout
 */
export async function multiGetWithTimeout(
  keys: string[],
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Array<[string, string | null]>> {
  try {
    const result = await withTimeout(AsyncStorage.multiGet(keys), timeoutMs);
    return result as Array<[string, string | null]>;
  } catch (error) {
    console.error('Failed to multi-get from AsyncStorage:', error);
    throw error;
  }
}

/**
 * Multi-set in AsyncStorage with timeout
 */
export async function multiSetWithTimeout(
  keyValuePairs: Array<[string, string]>,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<void> {
  try {
    await withTimeout(AsyncStorage.multiSet(keyValuePairs), timeoutMs);
  } catch (error) {
    console.error('Failed to multi-set in AsyncStorage:', error);
    throw error;
  }
}
