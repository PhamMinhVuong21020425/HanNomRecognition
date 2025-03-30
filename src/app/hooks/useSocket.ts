import { useEffect, useState } from 'react';
import { connectSocket } from '@/lib/socket';

export function useTrainingUpdates() {
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    // Connect to socket
    const socket = connectSocket();

    // Listen for incoming messages (received from Express server)
    socket.on('trainingResult', data => {
      console.log('[📡] Received training update:', data);
      setUpdates(prev => [...prev, data]);
    });

    // Cleanup on component unmount
    return () => {
      socket.off('trainingResult');
    };
  }, []);

  return updates;
}
