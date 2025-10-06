import { config } from 'dotenv';

config({ path: '.env.local' });

console.log(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
