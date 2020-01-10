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

function test(next, timeout = 100) {
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
/*
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
describe('P', function() {
  it('Constructor creates an instance of P', () => {
    const p = test('val');
    expect(p).toBeInstanceOf(P);
  });
  it('Should be thennable', done => {
    const p = test('a')
      .then(val => done())
      .catch(e => done.fail());
  });
  it('Should catch failures', done => {
    const p = test()
      .then(val => done.fail())
      .catch(e => done());
  });
  it('Should be able to chain promises together', done => {
    const p = test('a')
      .then(val => test(val))
      .then(next => {
        expect(next).toEqual('a');
        done();
      })
      .catch(e => done.fail());
  });
  it('Values should pass down the promise chain', done => {
    const p = test('a')
      .then(val => test(val + 'b'))
      .then(next => {
        expect(next).toEqual('ab');
        done();
      })
      .catch(e => done.fail());
  });
  it('P.resolve should cause the chain to resolve with a particular val', done => {
    const p = test('a')
      .then(val => P.resolve('newVal'))
      .then(next => {
        expect(next).toEqual('newVal');
        done();
      })
      .catch(e => done.fail());
  });
  it('P.reject should cause the chain to reject with a particular error', done => {
    const p = test('a')
      .then(val => P.reject('Error Message'))
      .then(next => {
        done.fail()
      })
      .catch(e => {
        expect(e).toEqual('Error Message');
        done();
      });
  });
  it('Finally should be called even if there is a rejection', done => {
    const p = test('a')
      .then(val => P.reject('Error Message'))
      .then(next => next)
      .catch(e => e)
      .finally(() => done());
  });
});
