import mongoose, { ConnectOptions } from "mongoose";
import { MONGODB_URI } from "../env";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  let mongooseCache: MongooseCache;
}

const globalAny = global as typeof globalThis & { mongooseCache?: MongooseCache };

const cache = globalAny.mongooseCache || { conn: null, promise: null };
globalAny.mongooseCache = cache;

async function db(): Promise<mongoose.Connection> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    const opts: ConnectOptions = { bufferCommands: false };
    cache.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m.connection);
  }

  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    throw e;
  }

  return cache.conn;
}

export default db;
