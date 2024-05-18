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
        this.users = this.db.collection('users');
        this.files = this.db.collection('files');
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
    return this.users.countDocuments();
  }

  async nbFiles() {
    return this.files.countDocuments();
  }

  async findUser(obj) {
    const user = await this.users.findOne(obj);
    return user;
  }

  async findFile(obj) {
    const file = await this.files.findOne(obj);
    return file;
  }
}

const dbClient = new DBClient();
export default dbClient;
