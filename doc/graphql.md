# 添加 graphql

## GraphQL

Egg.js 官方文档还没有对graphql有支持，但在官方的git组中却有相应的支持插件[egg-graphql](https://github.com/eggjs/egg-graphql)

关于什么是 [GraphQL](https://graphql.cn) , 看官方来详细了解是小不了的，这里就不详说了。

对[egg-graphql](https://github.com/eggjs/egg-graphql) 细看后，感觉有点繁琐，需要定义  `Schema`, `Resolvers`, `Models`, 和 `Connectors` 这里需要对每一个 `Sequelize` 定义过的 ORM 又做一次 `GraphQL` 的对应定于。而且不是用Ts来写，和我们这次的目标，全ts有点不太符合。

于是又找了一遍，发现原来又一个[TypeGraphql](https://typegraphql.com) 的支持。它的`Schema`定义也是使用装饰器的模式。和我们之前做的`sequelize-typescript` 定义 `model` 非常相似。于是，我再找了一下，果然轮子已经有了！

[egg-type-graphql](https://github.com/forsigner/egg-type-graphql) 都符合我们的要求，但是不是官方维护的，12个start，2个fork， 作者2年没有更新了(￣▽￣)，有点小担心，不过先用一下吧。

## egg-type-graphql 初试

```bash
yarn add graphql@^14.1.1 egg-type-graphql
```

然后 [config/config.default.ts](../config/config.default.ts) 添加

```js
const bizConfig = {
  ...
  typeGraphQL: {
    router: '/graphql',
    dateScalarMode: 'isoDate',
  },
}
```

[config/plugin.ts](../config/plugin.ts) 添加

```js
const plugin: EggPlugin = {
  typeGraphQL: {
    enable: true,
    package: 'egg-type-graphql',
  },
}
```

然后就是见对应的 `Schema`，打开之前创建的 [app/model/user.ts](../app/model/user.ts)，把代码变更为

```js
import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Field, ObjectType, ID, InputType } from 'type-graphql';

@ObjectType({ description: 'This is User Type' })
@Table({
  modelName: 'user',
})
export class User extends Model<User> {

  @Field(() => ID, { description: 'id' })
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER(11),
    comment: '用户ID',
  })
  id: number;

  @Field({ description: '用户姓名' })
  @Column({
    comment: '用户姓名',
  })
  name: string;

  @Field({ nullable: true, description: '年龄' })
  @Column({
    type: DataType.INTEGER(3),
    comment: '年龄',
  })
  age?: number;

  @Field({ nullable: true, description: '创建时间' })
  @Column({
    field: 'created_at',
  })
  createdAt: Date;

  @Field({ nullable: true, description: '更新时间' })
  @Column({
    field: 'updated_at',
  })
  updatedAt: Date;
}

@InputType()
export class UserInput implements Partial<User> {
  @Field()
  name: string;

  @Field({ nullable: true })
  age?: number;
}

export default () => User;

```

其中 `ObjectType` 是 `graphql` 的 `Models` 定义，这里把它和 `sequelize` 的 `Table` 定义公用同一个 `class` 定义，这样可以避免ORM的更改时导致的不同步问题。

`InputType` 是 `graphql` 的 `Mutation` 方法时一个类表单的对象，一般作为对象创建时的入参。

下面时一个 `Resolver` 的例子，新建文件 [app/graphql/user.resolver.ts](../app/graphql/user.resolver.ts)

```js
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

```

其中的 `ListQuery` 是自定义的一种常用的多入参对象。在同文件夹 [app/graphql/customBaseType.ts](../app/graphql/customBaseType.ts)， 这里把一般的分页请求的入参定义成 class `ListQuery`，通过传入 `page` 和 `limit` 会计算出需要的 `offset` 参数，还有为了更方便的直接使用 `sequelize` 本身的能力，通过 `where` 字符串参数转成 `filter` 对象。

然后运行

```bash
yarn dev
```

看到服务已经可以跑起来，然后在浏览器访问[http://127.0.0.1:7001/graphql](http://127.0.0.1:7001/graphql)，这个时候可以看到 `GraphQL Playground`了～

尝试点击右边的 `Docs`, 但是一直在转转转，什么鬼？

看回控制台发现

```bash
WARN 59052 [-/127.0.0.1/-/1ms POST /graphql] invalid csrf token. See https://eggjs.org/zh-cn/core/security.html#安全威胁csrf的防范

WARN 59052 [-/127.0.0.1/-/1ms POST /graphql] nodejs.ForbiddenError: invalid csrf token
```

原来是 egg 的 `csrf` 没有在 `GraphQL Playground` 的请求上，由于之后是会有对应的权限验证部分，所以这里可以把`csrf`暂时关闭，或针对这个路径关闭

在[config/config.default.ts](../config/config.default.ts) 添加

```js
const bizConfig = {
  ...
  security: {
    csrf: {
      ignore: /^\/graphql/,
    },
  },
}

```

再重新启动就好了～

看右边的 `Docs`，就可以看到刚才我们写的两个接口

现在我们先试试 `mutation`， 在刚才的`GraphQL Playground` 输入

```graphql
mutation {
  addUser(data: {
    name:"test"
  }) {
    name
  }
}
```

没有问题的话，会返回

```json
{
  "data": {
    "addUser": {
      "name": "test"
    }
  }
}
```

然后再试试 `query`

```graphql
{
  getUsers{
    name
  }
}
```

没有问题的话，会返回

```json
{
  "data": {
    "getUsers": [
      {
        "name": "test"
      }
    ]
  }
}
```

非常好，最基础的`graphql`环境已经搭建好～ 