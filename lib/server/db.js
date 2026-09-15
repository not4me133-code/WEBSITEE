import { MongoClient } from 'mongodb';

export async function getDb() {
  if (!process.env.MONGO_URL || !process.env.DB_NAME) throw new Error('Database configuration is missing.');
  if (!globalThis.apexDbPromise) {
    globalThis.apexDbPromise = (async () => {
      const client = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 10, serverSelectionTimeoutMS: 8000 });
      await client.connect();
      const db = client.db(process.env.DB_NAME);
      await Promise.all([
        db.collection('apex_users').createIndex({ email: 1 }, { unique: true }),
        db.collection('apex_users').createIndex({ providerId: 1 }, { unique: true, sparse: true }),
        db.collection('apex_auth_sessions').createIndex({ tokenHash: 1 }, { unique: true }),
        db.collection('apex_auth_sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
        db.collection('apex_practice_sessions').createIndex({ userId: 1, completedAt: -1 }),
        db.collection('apex_practice_sessions').createIndex({ userId: 1, attemptId: 1 }, { unique: true }),
        db.collection('apex_oauth_states').createIndex({ stateHash: 1 }, { unique: true }),
        db.collection('apex_oauth_states').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
        db.collection('apex_oauth_used').createIndex({ sessionHash: 1 }, { unique: true }),
        db.collection('apex_rate_limits').createIndex({ key: 1 }, { unique: true }),
        db.collection('apex_rate_limits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      ]);
      return db;
    })().catch(error => { globalThis.apexDbPromise = null; throw error; });
  }
  return globalThis.apexDbPromise;
}
