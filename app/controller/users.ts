import { Controller } from 'egg';

const toInt = str => {
  if (typeof str === 'number') return str;
  if (!str) return str;
  return parseInt(str, 10) || 0;
};

export default class UserController extends Controller {
  public async index() {
    const { ctx } = this;
    const { query, model: {
      User,
    } } = ctx;
    const { limit = 10, offset = 0 } = query;
    ctx.body = await User.findAll({
      limit: toInt(limit), offset: toInt(offset),
    });
  }
}
