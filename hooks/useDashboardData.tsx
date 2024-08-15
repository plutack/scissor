import { useState, useEffect } from 'react';
import { useSocket } from '@/components/layout/socket-provider';
import { DashboardData } from "@/types/dashboard";


export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (isConnected && socket) {
      // Request initial data
      socket.emit('getDashboardData');

      // Listen for dashboard data updates
      socket.on('dashboardData', (newData: DashboardData) => {
        setData(newData);
        setIsLoading(false);
      });

      // Listen for errors
      socket.on('dashboardError', (err: string) => {
        setError(new Error(err));
        setIsLoading(false);
      });
    }

    return () => {
      if (socket) {
        socket.off('dashboardData');
        socket.off('dashboardError');
      }
    };
  }, [socket, isConnected]);

  return { data, isLoading, error };
};