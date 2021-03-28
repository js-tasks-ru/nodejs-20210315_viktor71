const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.partialLine = '';
  }

  _transform(chunk, encoding, callback) {
    this.split(chunk);
    callback();
  }

  _flush(callback) {
    callback(null, this.partialLine);
    this.partialLine = '';
  }

  split(chunk) {
    const [first, ...lines] = chunk.toString().split(os.EOL);
    if (!lines || lines.length === 0) {
      this.partialLine += first;
      return;
    }

    this.push(this.partialLine + first);

    this.partialLine = lines.pop();
    lines.forEach((line) => this.push(line));
  }
}

module.exports = LineSplitStream;
