import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export const useConnectivity = () => {
  const { isInternetReachable } = useNetInfo();
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (isInternetReachable === null) {
      return;
    }
    setIsConnected(isInternetReachable);
  }, [isInternetReachable]);

  return { isConnected };
};
