# 添加 sequelize 做mysql 的orm

## Sequelize

根据官方的介绍文档[egg.js - Sequelize](https://eggjs.org/zh-cn/tutorials/sequelize.html)

和官方的例子[sequelize-ts](https://github.com/eggjs/examples/tree/master/sequelize-ts)

细看后发现其例子中没有使用 graphql 的例子，如果有做过 graphql 的项目的话，会发现，这样会导致要写两份model，而且很多时model 的同步又是一个问题。

后来发现js的装饰器的写法，而ts的项目也很喜欢用上装饰器，这样子如果sequelize 的orm也是用装饰器来定义的话，就可以实现只有一份model的效果。

看官方 [egg-sequelize 的Fork](https://github.com/eggjs/egg-sequelize/network/members) 你会发现 [egg-sequelize-ts](https://github.com/stone-lyl/egg-sequelize-ts/blob/master/README.md)

具体的(配置教程)(https://github.com/stone-lyl/egg-sequelize-ts/blob/master/README.md)

部分重要的在这里贴出来

像官方的配置介绍一样，安装并配置 egg-sequelize-ts 插件（它会辅助我们将定义好的 Model 对象加载到 app 和 ctx 上）和 mysql2 模块：

```bash
yarn add egg-sequelize-ts mysql2
```


在 `config/plugin.ts` 文件中引入 egg-sequelize-ts 组件

```js
sequelize = {
    enable: true,
    package: 'egg-sequelize-ts'
}
```

在 `conif/config.{env}.ts` 中编写 sequelize 配置([更多配置项](https://github.com/eggjs/egg-sequelize))

```js
config.sequelize = {
    dialect: 'mysql',
    host: process.env.EGG_MYSQL_SERVER_PORT_3306_TCP_ADDR || '127.0.0.1',
    port: process.env.EGG_MYSQL_SERVER_PORT_3306_TCP_PORT || '3306',
    database: process.env.EGG_MYSQL_SERVER_ENV_MYSQL_DATABASE || `${appInfo.name}`,
    username: process.env.EGG_MYSQL_SERVER_ENV_MYSQL_USERNAME || 'root',
    password: process.env.EGG_MYSQL_SERVER_ENV_MYSQL_ROOT_PASSWORD || '123456',
    timezone: '+08:00',
};
```

这里统一使用环境变量优先加开发默认值的方式，这样在服务器就可以更好的控制了

## Migrations

由于是ts的项目，如果想像官方文档那样使用`Migrations`来管理数据库定义和model的更新的话，[`sequelize-cli`](https://github.com/sequelize/cli) 也需要换成对应的ts版本，同样在 的[fork](https://github.com/sequelize/cli/network/members)上找最多人用的 哪个 [sequelize-cli-typescript](https://github.com/douglas-treadwell/sequelize-cli-typescript)，但是这个分支很久没有维护了，sequelize-cli 新版本会导致执行不了。需要试试其他新的分支，其中[这个](https://github.com/sutanlab/sequelize-cli-typescript)是目前可以使用

```bash
yarn -D add @sutanlab/sequelize-cli-typescript
```

我们希望将所有数据库 Migrations 相关的内容都放在 database 目录下，所以我们在项目根目录下新建一个 `.sequelizerc` 配置文件：

```js
'use strict';

const path = require('path');

const migrationsPath = path.join(__dirname, 'database/migrations')

module.exports = {
  config: path.join(__dirname, 'database/config.ts'),
  'migrations-path': migrationsPath,
  'migrations-source-path': migrationsPath,
  'migrations-compiled-path': migrationsPath,
  'seeders-path': path.join(__dirname, 'database/seeders'),
  'models-path': path.join(__dirname, 'app/model'),
};

```

这里`migrations-compiled-path`的路径和`migrations-source-path`一样就是了，暂时没有发现提供自动的把`ts`的编译成`js`都是需要自己来编译，所以同一个文件夹就好了。

初始化 Migrations 配置文件和目录

```bash
yarn sequelize init:config
yarn sequelize init:migrations
```

这里需要手动自己创建 `database/migrations/compiled` 这个文件夹，不然后面运行 `db:migrate` 的时候会报没有这个文件夹的错误

生成出来的`config`是`.json`，但是在服务器的时候需要[动态的配置](https://sequelize.org/master/manual/migrations.html#dynamic-configuration)，把`config.json`删除。

创建`database/config.ts`

```js
/* eslint-disable @typescript-eslint/no-var-requires */

const { name } = require('../package.json');

const config = {
  dialect: 'mysql',
  host: process.env.EGG_MYSQL_SERVER_PORT_3306_TCP_ADDR || '127.0.0.1',
  port: process.env.EGG_MYSQL_SERVER_PORT_3306_TCP_PORT || '3306',
  database: process.env.EGG_MYSQL_SERVER_ENV_MYSQL_DATABASE || name,
  username: process.env.EGG_MYSQL_SERVER_ENV_MYSQL_USERNAME || 'root',
  password: process.env.EGG_MYSQL_SERVER_ENV_MYSQL_ROOT_PASSWORD || '123456',
  dialectOptions: {
    bigNumberStrings: true,
  },
};

module.exports = {
  config,
  development: config,
  test: config,
  production: config,
};

```

这里为了配置更唯一统一，把`config/config.default.ts`内的`sequelize`的配置改成直接引入这里的配置。

``` js
/* eslint-disable @typescript-eslint/no-var-requires */
import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
const { config: sequelizeConfig } = require('../database/config');


export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1610984891151_1122';

  // add your egg config in here
  config.middleware = [];

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,

    sequelize: {
      ...sequelizeConfig,
      timezone: '+08:00',
    },
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
```


此时 sequelize-cli 和相关的配置也都初始化好了，我们可以开始编写项目的第一个 Migration 文件来创建我们的一个 users 表了。

```bash
yarn sequelize migration:generate --name=init-users # 文件名
```

执行完后会在 `database/migrations` 目录下生成一个 migration 文件(`${timestamp}-init-users.ts`)，我们修改它来处理初始化 `users` 表：

```ts
import { QueryInterface, DataTypes } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface, dataTypes: DataTypes) => {
    const { INTEGER, DATE, STRING } = dataTypes;
    await queryInterface.createTable('users', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      name: STRING(30),
      age: INTEGER,
      created_at: DATE,
      updated_at: DATE,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('users');
  },
};

```

然后执行

```bash
yarn sequelize db:migrate
```

这个时候会发现 `No migrations were executed, database schema was already up to date`

这是因为没有进行`ts`的编译

所以这里需要先运行，egg内已经自带的`tsc`命令

```bash
yarn tsc
```

然后再执行

```bash
yarn sequelize db:migrate
```

再在之前构建的 `docker` 容器中 `mysql` 数据库就可以发现表已经构建好了

为了之后更方便的运行 `db:migrate` 可以在 `package.json` 加入命令

```json
{
  "scripts": {
    "db:up": "yarn tsc && yarn sequelize db:migrate && yarn clean",
    "db:undo:all": "yarn tsc && yarn sequelize db:migrate:undo:all && yarn clean",
    "db:undo": "yarn tsc && yarn sequelize db:migrate:undo && yarn clean"
  }
}
```

## Model

接着就是对应的 `model` 了，创建 `app/model/user.ts`

```js
import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
@Table({
  modelName: 'user',
})
export class User extends Model<User> {

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER(11),
    comment: '用户ID',
  })
  id: number;

  @Column({
    comment: '用户姓名',
  })
  name: string;

  @Column({
    type: DataType.INTEGER(3),
    comment: '年龄',
  })
  age: number;

  @Column({
    field: 'created_at',
  })
  createdAt: Date;

  @Column({
    field: 'updated_at',
  })
  updatedAt: Date;
}
export default () => User;
```

创建一个 `app/controller/users.ts` 

```js
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

```

在 `app/router.ts` 中添加对应的路由

```js
import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/', controller.home.index);

  router.resources('users', '/users', controller.users);
};

```

## 调试

然后可以运行项目看看效果

```bash
yarn dev
```

你可以通过在浏览器上请求，或者可以使用 `REST Client` VS code 的一个接口调试插件。这样就可以编写`.http` 的文件，进行接口调试，同时也可以当作简单的接口文档，一举二得。

创建文件 `http/users.http`

```http

GET {{host}}/users
Content-Type: application/json

```

同时可以通过环境变量方便的切换接口的环境，创建/修改 `.vscode/settings.json`

```json
{
  "prettier.disableLanguages": ["typescript", "typescriptreact"],
  "cSpell.words": ["autod"],
  "rest-client.environmentVariables": {
    "local": {
      "host": "http://127.0.0.1:7001"
    },
  }
}
```

然后使用 快捷键 `command + shift + p` 选择 local 的环境，回到 `http/users.http` 文件，可以点击 `Send Request` 就可以请求接口，看接口的返回结果了

## 单元测试

正如egg的官方文档那样，这里可以加入 [`factory-girl`](https://github.com/petejkim/factory-lady) 来做单元测试。

```
yarn -D add factory-lady
```

然后修改 `database/config.ts` 的test配置部分

```js
/* eslint-disable @typescript-eslint/no-var-requires */

const packageJson = require('../package.json');
const { name: database } = packageJson;

const config = {
  dialect: 'mysql',
  host: process.env.EGG_MYSQL_SERVER_PORT_3306_TCP_ADDR || '127.0.0.1',
  port: process.env.EGG_MYSQL_SERVER_PORT_3306_TCP_PORT || '3306',
  database: process.env.EGG_MYSQL_SERVER_ENV_MYSQL_DATABASE || database,
  username: process.env.EGG_MYSQL_SERVER_ENV_MYSQL_USERNAME || 'root',
  password: process.env.EGG_MYSQL_SERVER_ENV_MYSQL_ROOT_PASSWORD || '123456',
  dialectOptions: {
    bigNumberStrings: true,
  },
};

module.exports = {
  config,
  development: config,
  test: {
    ...config,
    database: `${config.database}_test`,
  },
  production: config,
};

```

同时添加一个新的测试才使用的 config 配置 `config/config.test.ts`

```js
/* eslint-disable @typescript-eslint/no-var-requires */
import { EggAppConfig, PowerPartial } from 'egg';
const { test: sequelizeConfig } = require('../database/config');


export default () => {
  const config: PowerPartial<EggAppConfig> = {
    sequelize: {
      ...sequelizeConfig,
      timezone: '+08:00',
    },
  };
  return config;
};
```

然后在 `test` 文件夹内添加 `factory-girl` 的相关配置,创新文件 `test/factories.ts`

由于 `factory-girl` 还没有做ts的支持，所以这里把我们用到的部分方法定义一下，这样ts构建的时候才可以通过eslint的检查

```js
import { factory } from 'factory-girl';
import { MockApplication } from 'egg-mock';

interface Factory {
  createMany(modelName: string, num: number): void
  define(modelName: string, model: any, initObj: any): void
  sequence(modelKey: string, initFunc: void)
}

export default (app: MockApplication) => {
  // 可以通过 app.factory 访问 factory 实例
  app.factory = factory;

  const { model: {
    User,
  } } = app;

  // 定义 user 和默认数据
  factory.define('user', User, {
    name: factory.sequence('User.name', n => `name_${n}`),
    age: 18,
  });
};


declare module 'egg-mock' {
  export interface MockApplication {
    factory: Factory
  }
}
```

然后就是编写我们的单元测试，创建文件 `test/app/controller/users.test.ts`，我们通过`factory-girl` 构建3条测试用的数据，然后再通过我们之前写的 `GET /users`的请求调用一下，这里把body的内容打印一下出来，方便看效果。

```js
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

```

最后在 `package.json` 中把 `ci` 的命令修改一下，留意这里使用`NODE_ENV`把环境变量改成`test`

```json
{
  "scripts": {
    "ci": "yarn lint && yarn tsc && NODE_ENV=test yarn sequelize db:create && NODE_ENV=test yarn sequelize db:migrate && yarn cov && yarn clean"
  } 
}
```

最后在控制台运行一下 ci 的命令看看效果吧！

```bash
yarn ci
```


---

下一节 [添加 graphql](https://github.com/ThomasLiu/egg_ts_showcase/blob/learn_4_graphql/doc/graphql.md)