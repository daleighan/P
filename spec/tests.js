const P = require('../index.js');

const asyncFunc = (data, ecb, scb, timeout) => {
  setTimeout(() => {
    if (!data) {
      ecb('failure in the end!');
    } else {
      scb(data);
    }
  }, timeout);
};

function testFunc(next, timeout = 100) {
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

describe('P', function() {
  it('Constructor creates an instance of P', () => {
    const p = testFunc('val');
    expect(p).toBeInstanceOf(P);
  });
  it('Should be thennable', done => {
    const p = testFunc('a')
      .then(val => done())
      .catch(e => done.fail());
  });
  it('Should catch failures', done => {
    const p = testFunc()
      .then(val => done.fail())
      .catch(e => done());
  });
  it('Should be able to chain promises together', done => {
    const p = testFunc('a')
      .then(val => testFunc(val))
      .then(next => {
        expect(next).toEqual('a');
        done();
      })
      .catch(e => done.fail());
  });
  it('Values should pass down the promise chain', done => {
    const p = testFunc('a')
      .then(val => testFunc(val + 'b'))
      .then(next => {
        expect(next).toEqual('ab');
        done();
      })
      .catch(e => done.fail());
  });
  it('P.resolve should cause the chain to resolve with a particular val', done => {
    const p = testFunc('a')
      .then(val => P.resolve('newVal'))
      .then(next => {
        expect(next).toEqual('newVal');
        done();
      })
      .catch(e => done.fail());
  });
  it('P.reject should cause the chain to reject with a particular error', done => {
    const p = testFunc('a')
      .then(val => P.reject('Error Message'))
      .then(next => {
        done.fail();
      })
      .catch(e => {
        expect(e).toEqual('Error Message');
        done();
      });
  });
  it('P.all should return an iterable of all resolved values from an iterable of promises', done => {
    const iter = [testFunc('a'), testFunc('b'), testFunc('c')];
    P.all(iter)
      .then(final => {
        expect(final).toEqual(['a', 'b', 'c']);
        done();
      })
      .catch(e => done.fail());
  });
  it('P.all should return values in the order they were called regardless of which returns first', done => {
    const iter = [testFunc('a'), testFunc('b'), testFunc('c', 50)];
    P.all(iter)
      .then(final => {
        expect(final).toEqual(['a', 'b', 'c']);
        done();
      })
      .catch(e => done.fail());
  });
  it('P.race should return the value of the first promise to resolve in an iterable', done => {
    const iter = [testFunc('a'), testFunc('b'), testFunc('c', 50)];
    P.race(iter)
      .then(final => {
        expect(final).toEqual('c');
        done();
      })
      .catch(e => done.fail());
  });
});
