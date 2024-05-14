import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor () {
    this.client = createClient();
    this.client.on('error', (err) => console.log(err));
  }

  isAlive () {
    return !this.client.connected;
  }

  async get (key) {
    const getValue = promisify(this.client.get).bind(this.client);
    return getValue(key);
  }

  async set (key, value, duration) {
    const setValue = promisify(this.client.set).bind(this.client);
    setValue(key, value);
    this.client.expire(key, duration);
  }

  async del (key) {
    const delValue = promisify(this.client.del).bind(this.client);
    return delValue(key);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
