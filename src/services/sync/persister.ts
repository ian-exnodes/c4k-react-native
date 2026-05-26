// src/services/sync/persister.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: '@finance/tanstack-cache',
  throttleTime: 1000, // debounce writes — avoid hammering storage
});
