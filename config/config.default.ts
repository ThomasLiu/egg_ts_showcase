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

    security: {
      csrf: {
        ignore: /^\/graphql/,
      },
    },

    sequelize: {
      ...sequelizeConfig,
      timezone: '+08:00',
    },

    typeGraphQL: {
      router: '/graphql',
      dateScalarMode: 'isoDate',
    },
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
