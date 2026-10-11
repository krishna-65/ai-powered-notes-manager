// Imported first so environment variables are set before the modules below read them.
import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDatabase } from './config/db.js';

const PORT = process.env.PORT ?? 5000;
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/ai-powered-notes';

try {
  await connectDatabase(MONGODB_URI);
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
} catch (error) {
  console.error('Failed to start server:', error.message);
  await mongoose.disconnect();
  process.exit(1);
}
