import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env' });

try {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('MONGO_CONNECT_OK');
  await mongoose.disconnect();
} catch (e) {
  console.log('MONGO_CONNECT_FAIL');
  console.log('name:', e?.name || 'unknown');
  console.log('message:', e?.message || 'unknown');
  console.log('topology:', e?.reason?.type || 'unknown');

  if (e?.reason?.servers) {
    for (const [host, desc] of e.reason.servers) {
      console.log('host:', host);
      console.log('hostType:', desc?.type || 'unknown');
      console.log('hostErrName:', desc?.error?.name || 'none');
      console.log('hostErrMessage:', desc?.error?.message || 'none');
    }
  }
}
