import { Context } from 'egg';
import { Resolver, Query, Mutation, Args, Arg, Ctx } from 'type-graphql';
import { User } from '../model/user';


@Resolver(() => User)
export class UserResolver {

  // eslint-disable-next-line array-bracket-spacing
  @Query(() => [User], { description: '查询用户列表' })
  async getUsers(@Args() { filter, order }: DefaultQuery, @Ctx() ctx: Context): Promise<User[]> {

    const { rows: list } = await ctx.model.User.findAndCountAll({
      ...filter,
      order,
    });
    return list;
  }


  @Mutation(() => User)
  async addUser(@Arg('body') body: User, @Ctx() ctx: Context): Promise<User> {
    return await ctx.model.User.create(body);
  }
}
