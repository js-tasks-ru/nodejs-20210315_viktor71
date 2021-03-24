const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.limit = options.limit;
    this.received = 0;
  }

  _transform(chunk, encoding, callback) {
    this.received += chunk.length;
    if (this.received > this.limit) {
      callback(new LimitExceededError);
    } else {
      callback(null, chunk);
    }
  }
}

module.exports = LimitSizeStream;
