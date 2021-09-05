const mongodb=  require('mongodb');

const MONGODB_URI = 'mongodb+srv://admin:root@carpecluster.1wbu3.mongodb.net/carpeDB?retryWrites=true&w=majority'
, MONGODB_DB = 'carpeDB';

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

if (!MONGODB_DB) {
    throw new Error(
        'Please define the MONGODB_DB environment variable inside .env.local'
    );
}
/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentiatlly
 * during API Route usage.
 */
let cached = global.mongo;
if (!cached) cached = global.mongo = {};
/*
* Connect to database
* */
export async function connectToDatabase() {
    if (cached.conn) return cached.conn;
    if(!cached.promise) {
        const conn = {};
        // console.log(MONGODB_URI);
        cached.promise = mongodb.MongoClient.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
            .then((client) => {
                conn.client = client;
                return client.db(MONGODB_DB);
            })
            .then((db) => {
                conn.db = db;
                cached.conn = conn;
            })
    }
    await cached.promise;
    return cached.conn;
}
