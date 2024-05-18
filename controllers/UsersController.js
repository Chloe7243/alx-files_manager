import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).send({ error: 'Missing email' });
    }
    const user = await dbClient.findUser(email);
    if (!password) {
      return res.status(400).send({ error: 'Missing password' });
    }
    if (user) {
      return res.status(400).send({ error: 'Already exist' });
    }
    const hashedPassword = sha1(password);
    const data = await dbClient.users.insertOne({
      email,
      password: hashedPassword,
    });
    return res.status(201).send({ email, id: data.insertedId });
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    const userID = await redisClient.get(`auth_${token}`);
    const user = await dbClient.findUser('_id', userID);
    if (userID && user) {
      return res.status(200).send({ email: user.email, id: user._id });
    }
    return res.status(401).send({ error: 'Unauthorized' });
  }
}
