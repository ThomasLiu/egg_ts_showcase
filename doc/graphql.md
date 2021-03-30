# 添加 graphql

## GraphQL

Egg.js 官方文档还没有对graphql有支持，但在官方的git组中却有相应的支持插件[egg-graphql](https://github.com/eggjs/egg-graphql)

关于什么是 [GraphQL](https://graphql.cn) , 看官方来详细了解是小不了的，这里就不详说了。

对[egg-graphql](https://github.com/eggjs/egg-graphql) 细看后，感觉有点繁琐，需要定义  `Schema`, `Resolvers`, `Models`, 和 `Connectors` 这里需要对每一个 `Sequelize` 定义过的 ORM 又做一次 `GraphQL` 的对应定于。而且不是用Ts来写，和我们这次的目标，全ts有点不太符合。

于是又找了一遍，发现原来又一个[TypeGraphql](https://typegraphql.com) 的支持。它的`Schema`定义也是使用装饰器的模式。和我们之前做的`sequelize-typescript` 定义 `model` 非常相似。于是，我再找了一下，果然轮子已经有了！

[egg-type-graphql](https://github.com/forsigner/egg-type-graphql) 都符合我们的要求，但是不是官方维护的，12个start，2个fork， 作者2年没有更新了(￣▽￣)，有点小担心，不过先用一下吧。

## egg-type-graphql 初试

```bash
yarn add graphql
yarn add egg-type-graphql
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
import { Field, ObjectType, ID } from 'type-graphql';
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

  @Field({ nullable: true, description: '用户姓名' })
  @Column({
    comment: '用户姓名',
  })
  name: string;

  @Field({ nullable: true, description: '年龄' })
  @Column({
    type: DataType.INTEGER(3),
    comment: '年龄',
  })
  age: number;

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
export default () => User;
```

