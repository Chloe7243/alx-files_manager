import sha1 from 'sha1';
import dbClient from '../utils/db';

export default class UsersController {
  static async postNew(req, res) {
    let user;
    const { email, password } = req.body;
    await dbClient.users.findOne({ email }).then((result) => {
      user = result;
    });
    console.log({ user });

    if (!email) {
      res.status(400).send('Missing email');
    } else if (!password) {
      res.status(400).send('Missing password');
    } else if (user) {
      res.status(400).send('Already exist');
    } else {
      const hashedPassword = sha1(password);
      const data = await dbClient.users.insertOne({
        email,
        password: hashedPassword,
      });
      console.log(data);
      res.status(201).send(data.insertedId);
    }
  }
}
