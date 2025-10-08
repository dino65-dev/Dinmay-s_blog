import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const WAKE_CHECK_INTERVAL = 5000; // Check every 5 seconds
const WAKE_TIMEOUT = 60000; // Give up after 60 seconds

export const useBackendStatus = (autoCheck = true) => {
  const [isWaking, setIsWaking] = useState(false);
  const [isAwake, setIsAwake] = useState(null); // null = unknown, true = awake, false = sleeping
  const [wakeProgress, setWakeProgress] = useState(0);

  const checkBackendStatus = useCallback(async () => {
    try {
      const result = await api.ping();
      if (result) {
        setIsAwake(true);
        setIsWaking(false);
        setWakeProgress(100);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  const wakeBackend = useCallback(async () => {
    setIsWaking(true);
    setWakeProgress(10);
    
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(90, (elapsed / WAKE_TIMEOUT) * 100);
      setWakeProgress(progress);
    }, 500);

    const attemptWake = async () => {
      const maxAttempts = WAKE_TIMEOUT / WAKE_CHECK_INTERVAL;
      
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const isUp = await checkBackendStatus();
        
        if (isUp) {
          clearInterval(checkInterval);
          setWakeProgress(100);
          return true;
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, WAKE_CHECK_INTERVAL));
      }
      
      clearInterval(checkInterval);
      setIsWaking(false);
      return false;
    };

    return attemptWake();
  }, [checkBackendStatus]);

  useEffect(() => {
    if (autoCheck && isAwake === null) {
      // Check backend status on mount
      checkBackendStatus();
    }
  }, [autoCheck, isAwake, checkBackendStatus]);

  return {
    isWaking,
    isAwake,
    wakeProgress,
    checkBackendStatus,
    wakeBackend,
  };
};

export default useBackendStatus;
