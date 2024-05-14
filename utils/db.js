import MongoClient from 'mongodb';

const PORT = process.env.DB_PORT || '27017';
const HOST = process.env.DB_HOST || 'localhost';
const URL = `mongodb://${HOST}:${PORT}`;
const DB = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    this.db = false;
    MongoClient(URL, { useUnifiedTopology: true })
      .then((client) => {
        this.db = client.db(DB);
        this.client = client;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  isAlive() {
    return Boolean(this.db);
  }

  async nbUsers() {
    return this.db.collection('users').count();
  }

  async nbFiles() {
    return this.db.collection('files').count();
  }
}

const dbClient = new DBClient();
export default dbClient;
