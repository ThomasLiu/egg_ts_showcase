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
