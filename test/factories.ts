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
