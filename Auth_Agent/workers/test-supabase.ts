import { createClient } from '@supabase/supabase-js';

const client = createClient('https://test.supabase.co', 'test-key');
console.log('Client type:', typeof client);
console.log('Has from:', typeof client.from);
console.log('Client proto:', Object.getPrototypeOf(client));
