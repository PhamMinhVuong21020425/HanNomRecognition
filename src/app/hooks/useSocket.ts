import { useEffect, useState } from 'react';
import { connectSocket } from '@/lib/socket';

export function useTrainingUpdates() {
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    // Connect to socket
    const socket = connectSocket();

    // Listen for incoming messages (received from Express server)
    socket.on('receive_message', message => {
      console.log('[📡] Received training update:', message);
      setUpdates(prev => [...prev, message]);
    });

    // Cleanup on component unmount
    return () => {
      socket.off('receive_message');
    };
  }, []);

  return updates;
}
