// Implement a promise class with resolve, reject, .then, .catch and .all

class P {
  constructor(action) {
    this.state = 'pending';
    this.observers = [];
    this.value = null;
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
    this.catch = this.catch.bind(this);
    try {
      action(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  execObservers() {
    for (let observer of this.observers) {
      if (this.state === 'fulfilled') {
        observer.onResolve(this.value);
      } else if (this.state === 'rejected') {
        observer.onReject(this.value);
      }
    }
  }

  handleSettling(val, newStatus) {
    if (this.state !== 'pending') {
      return;
    }
    if (val && typeof val === 'object' && typeof val.then === 'function') {
      return val.then(this.resolve, this.reject);
    }
    this.state = newStatus;
    this.value = val;
    this.execObservers();
  }

  resolve(val) {
    this.handleSettling(val, 'fulfilled');
  }

  reject(err) {
    this.handleSettling(err, 'rejected');
  }

  then(onResolve = () => {}, onReject = this.catch) {
    const passedVal = this.value;
    return new P((resolve, reject) => {
      const _onResolve = val => {
        try {
          resolve(onResolve(this.value));
        } catch (e) {
          reject(e);
        }
      };
      const _onReject = err => {
        if (typeof onReject === 'function') {
          reject(onReject(err));
        } else {
          reject(err);
        }
      };
      if (this.state === 'fulfilled') {
        return _onResolve(this.value);
      } else if (this.state === 'rejected') {
        return _onReject(this.value);
      } else {
        this.observers.push({onResolve: _onResolve, onReject: _onReject});
      }
    });
  }

  catch(reject) {
    return this.then(null, reject);
  }

  finally(cb) {
    return this.then(cb, cb);
  }

  static iterate(iter, required = iter.length, useIter = true) {
    return new P((resolve, reject) => {
      const output = [];
      let err = null;
      for (let prom of iter) {
        prom
          .then(val => {
            output.push(val);
            if (output.length === required) {
              resolve(useIter ? output : output[0]);
            }
          })
          .catch(e => reject(e));
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
/*
const asyncFunc = (data, ecb, scb, timeout) => {
  setTimeout(() => {
    if (!data) {
      ecb('failure in the end!');
    } else {
      scb(data);
    }
  }, timeout);
};

function test(next, timeout = 1000) {
  return new P((resolve, reject) => {
    asyncFunc(
      next,
      val => {
        reject(val);
      },
      val => {
        resolve(val);
      },
      timeout,
    );
  });
}
const p = test('Alex')
  .then(data => P.reject('some crazy error!'))
  .then(chained => test(chained + 'next'))
  .then(final => console.log('final', final))
  .catch(e => console.log('error', e))
  .finally(data => console.log('finally!!!!'));
 
const iter = [test('a'), test('b'), test('c', 200)];
P.all(iter)
  .then(final => console.log('final', final))
  .catch(e => console.log('err', e));
*/
