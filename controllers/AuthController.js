import sha1 from 'sha1';
import { v4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class AuthController {
  static async getConnect(req, res) {
    const Auth = req.headers.authorization.split(' ');
    if (Auth.length === 2 && Auth[0] === 'Basic') {
      const userCredential = Auth[1];
      const base64Decode = Buffer.from(userCredential, 'base64').toString(
        'binary',
      );
      const [email, password] = base64Decode.split(':');
      const endodedP = sha1(password);
      const user = await dbClient.findUser(email);

      if (user) {
        if (endodedP === user.password) {
          const token = v4();
          const key = `auth_${token}`;
          await redisClient.set(key, user._id.toString(), 24 * 60 * 60);
          return res.status(200).send({ token });
        }
        return res.status(401).send({ error: 'Unauthorized' });
      }
    }
    return res.status(401).send({ error: 'Unauthorized' });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    const data = await redisClient.del(`auth_${token}`);
    if (data) {
      return res.status(204).send();
    }
    return res.status(401).send({ error: 'Unauthorized' });
  }
}
