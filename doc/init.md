# ts 初始化

按照egg 官网 [TypeScript教程](https://eggjs.org/zh-cn/tutorials/typescript.html) 构建骨架

``` dash
$ npm init egg --type=ts
```

目录结构

``` md
├── app
│   ├── controller
│   │   └── home.ts
│   ├── service
│   │   └── news.ts
│   └── router.ts
├── config
│   ├── config.default.ts
│   ├── config.local.ts
│   ├── config.prod.ts
│   └── plugin.ts
├── test
│   └── **/*.test.ts
├── typings
│   └── **/*.d.ts
├── README.md
├── package.json
├── tsconfig.json
└── tslint.json
```

尝试跑test

``` dash
$ yarn
$ yarn test
```

尝试跑dev

``` dash
$ yarn dev
```

在浏览器输入提示的路由 http://127.0.0.1:7001