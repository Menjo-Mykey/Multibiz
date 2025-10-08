import { useEffect, useState } from 'react';
import { offlineStorage } from '@/lib/offlineStorage';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineTransactions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "Transactions will be saved locally and synced when online",
        variant: "default",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync check
    if (navigator.onLine) {
      syncOfflineTransactions();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineTransactions = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      await offlineStorage.init();
      const unsyncedTransactions = await offlineStorage.getUnsyncedTransactions();

      if (unsyncedTransactions.length === 0) {
        setIsSyncing(false);
        return;
      }

      toast({
        title: "Syncing...",
        description: `Syncing ${unsyncedTransactions.length} offline transactions`,
      });

      for (const transaction of unsyncedTransactions) {
        try {
          const { error } = await supabase.from('sales').insert([{
            business_id: transaction.business_id,
            staff_id: transaction.staff_id,
            customer_id: transaction.customer_id,
            total_amount: transaction.total_amount,
            payment_method: transaction.payment_method,
            notes: transaction.notes,
            created_at: transaction.created_at,
          }] as any);

          if (!error) {
            await offlineStorage.markAsSynced(transaction.id);
          }
        } catch (error) {
          console.error('Error syncing transaction:', error);
        }
      }

      toast({
        title: "Sync Complete",
        description: "All offline transactions have been synced",
      });
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isSyncing,
    syncOfflineTransactions,
  };
};
