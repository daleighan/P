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
    const p = test('a').then(val => done()).catch(e => done.fail());
  });
  it('Should catch failures', done => {
    const p = test().then(val => done.fail()).catch(e => done());
  });
});
