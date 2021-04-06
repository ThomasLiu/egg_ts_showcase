import { Context } from 'egg';
import { Resolver, Query, Mutation, Args, Arg, Ctx } from 'type-graphql';
import { User, UserInput } from '../model/user';
import { ListQuery } from './customBaseType';

@Resolver(() => User)
export class UserResolver {

  // eslint-disable-next-line array-bracket-spacing
  @Query(() => [User], { description: '查询用户列表' })
  async getUsers(@Args() { filter, offset, limit }: ListQuery, @Ctx() ctx: Context): Promise<User[]> {

    const { rows: list } = await ctx.model.User.findAndCountAll({
      ...filter,
      offset,
      limit,
    });
    return list;
  }


  @Mutation(() => User)
  async addUser(@Arg('data') user: UserInput, @Ctx() ctx: Context): Promise<User> {
    return await ctx.model.User.create(user);
  }
}
