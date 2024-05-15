import sha1 from 'sha1';
import dbClient from '../utils/db';

export default class UsersController {
  static postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).send('Missing email');
    } else if (!password) {
      res.status(400).send('Missing password');
    } else if (dbClient.db.users.find({ email })) {
      res.status(400).send('Already exist');
    } else {
      const hashedPassword = sha1(password);
      const data = dbClient.db.products.insertOne({
        email,
        password: hashedPassword,
      });
      res.status(201).send(data.insertedId);
    }
  }
}
