class P {
  constructor(action) {
    this.state = 'pending';
    this.value = null;
    this.onResolve = () => {};
    this.onReject = () => {};
    this.catch = this.catch.bind(this);
    const resolve = value => handleChange(value, 'fulfilled');
    const reject = err => handleChange(err, 'rejected');
    const handleChange = (value, newState) => {
      if (value && value instanceof P) {
        return value.then(resolve, reject);
      }
      this.state = newState;
      this.value = value;
      this.callObservers();
    };
    action(resolve, reject);
  }

  callObservers() {
    if (this.state === 'fulfilled') {
      this.onResolve(this.value);
    } else {
      this.onReject(this.value);
    }
  }

  then(onResolve = () => {}, onReject = this.catch) {
    return new P((resolve, reject) => {
      const _onResolve = val => {
        try {
          resolve(onResolve(val));
        } catch (e) {
          reject(onReject(err));
        }
      };
      const _onReject = err => {
        if (typeof onReject === 'function') {
          return reject(onReject(err));
        }
        reject(err);
      };
      if (this.state === 'fulfilled') {
        return _onResolve(this.value);
      }
      if (this.state === 'rejected') {
        return _onReject(this.value);
      }
      this.onResolve = _onResolve;
      this.onReject = _onReject;
    });
  }

  catch(rejectCb) {
    return this.then(undefined, rejectCb);
  }

  finally(cb) {
    return this.then(cb, cb);
  }

  static iterate(iter, length = iter.length) {
    let output = [];
    let finished = false;
    return new P((resolve, reject) => {
      for (let i = 0; i < iter.length; i++) {
        let prom = iter[i];
        prom.then(
          value => {
            output.push({i, value});
            if (output.length === length) {
              if (!finished) {
                resolve(
                  output.length > 1
                    ? output.sort((a, b) => a.i - b.i).map(entry => entry.value)
                    : output[0].value,
                );
                finished = true;
              }
            }
          },
          err => {
            if (!finished) {
              finished = true;
              reject(err);
            }
          },
        );
      }
    });
  }

  static all(iter) {
    return this.iterate(iter);
  }

  static race(iter) {
    return this.iterate(iter, 1, false);
  }

  static resolve(val) {
    return new P(resolve => resolve(val));
  }

  static reject(reason) {
    return new P((_, reject) => reject(reason));
  }
}

module.exports = P;
