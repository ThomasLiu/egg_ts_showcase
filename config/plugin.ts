import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  // static: true,
  // nunjucks: {
  //   enable: true,
  //   package: 'egg-view-nunjucks',
  // },

  sequelize: {
    enable: true,
    package: 'egg-sequelize-ts',
  },

  typeGraphQL: {
    enable: true,
    package: 'egg-type-graphql',
  },
};

export default plugin;
