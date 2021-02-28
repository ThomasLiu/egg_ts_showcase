import * as assert from 'assert';
import { app } from 'egg-mock/bootstrap';

describe('test/app/controller/users.test.ts', () => {
  it('should GET /users', async () => {
    await app.factory.createMany('user', 3);
    const res = await app.httpRequest().get('/users?limit=2');
    assert(res.status === 200);
    assert(res.body.length === 2);
    assert(res.body[0].name);
    assert(res.body[0].age);
    console.log(JSON.stringify(res.body));
  });
});
