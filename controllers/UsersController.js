import sha1 from 'sha1';
import dbClient from '../utils/db';
import throwError from '../utils/throwError';
import getUserByToken from '../utils/getUserByToken';
import throwUnauthError from '../utils/throwUnauthError';

export default class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      throwError(res, 'Missing email');
    }
    const user = await dbClient.findUser({ email });
    if (!password) {
      throwError(res, 'Missing password');
    }
    if (user) {
      throwError(res, 'Already exist');
    }
    const hashedPassword = sha1(password);
    const data = await dbClient.users.insertOne({
      email,
      password: hashedPassword,
    });
    return res.status(201).send({ email, id: data.insertedId });
  }

  static async getMe(req, res) {
    const user = await getUserByToken(req);
    if (user) {
      return res.status(200).send({ email: user.email, id: user._id.toString() });
    }
    return throwUnauthError(res);
  }
}
