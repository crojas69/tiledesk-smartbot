const redis = require('redis');

class TdCache {

    constructor(config) {
        this.redis_host = config.host;
        this.redis_port = config.port;
        this.redis_password = config.password;
        this.client = null;
    }

async connect(callback) {
    // Create Redis connection URL
    let redisUrl = `redis://${this.redis_host}:${this.redis_port}`;
    if (this.redis_password) {
        redisUrl = `redis://:${this.redis_password}@${this.redis_host}:${this.redis_port}`;
    }
    
    this.client = redis.createClient({
        url: redisUrl
    });
    
    this.client.on('error', err => {
        console.error("Redis Client Error:", err);
        if (callback) {
            callback(err);
        }
    });

    try {
        await this.client.connect();
        if (callback) {
            callback();
        }
    } catch (err) {
        if (callback) {
            callback(err);
        }
        throw err;
    }
}


async set(key, value, options) {
  //console.log("setting key value", key, value)
  let redis_options = {};
  if (options && options.EX) {
    redis_options.EX = options.EX;
  } else if (!options) {
    redis_options.EX = 86400;
  }
  await this.client.set(key, value, redis_options);
  if (options && options.callback) {
      options.callback();
  }
}


async incr(key) {
  // console.log("incr key:", key)
  return await this.client.incr(key);
}

async incrby(key, increment) {
  return await this.client.incrBy(key, increment);
}

async incrbyfloat(key, increment) {
  return await this.client.incrByFloat(key, increment);
}


async hset(dict_key, key, value, options) {
  //console.log("hsetting dict_key key value", dict_key, key, value)
  const result = await this.client.hSet(dict_key, key, value);
  if (options && options.callback) {
      options.callback();
  }
  return result;
}


async hdel(dict_key, key, options) {
  //console.log("hsetting dict_key key value", dict_key, key, value)
  const result = await this.client.hDel(dict_key, key);
  if (options && options.callback) {
      options.callback();
  }
  return result;
}

    
    async setJSON(key, value, options) {
      const _string = JSON.stringify(value);
      return await this.set(key, _string, options);
    }
    
async get(key, callback) {
  const value = await this.client.get(key);
  if (callback) {
    callback(null, value);
  }
  return value;
}


async hgetall(dict_key, callback) {
  //console.log("hgetting dics", dict_key);
  const value = await this.client.hGetAll(dict_key);
  if (callback) {
    callback(null, value);
  }
  return value;
}


async hget(dict_key, key, callback) {
  //console.log("hgetting dics", dict_key);
  const value = await this.client.hGet(dict_key, key);
  if (callback) {
    callback(null, value);
  }
  return value;
}

    
async getJSON(key, callback) {
  const value = await this.get(key);
  if (value) {
    return JSON.parse(value);
  }
  return null;
}

    
async del(key, callback) {
  const result = await this.client.del(key);
  if (callback) {
      callback(null, result);
  }
  return result;
}

}

module.exports = { TdCache };
