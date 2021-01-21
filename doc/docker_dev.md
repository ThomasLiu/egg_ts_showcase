# docker 构建开发依赖的 mysql 和 redis

项目中会经常用到Mysql 和 redis，所以在开发期间可以更简单的使用docker构建这些环境，将会减小很多配置环境时不必要时间。

在项目的根目录创建`docker-compose-dev.yml`

``` docker
mysql:
  image: mysql:5.7
  container_name: mysql-server-dev
  command:
    ["--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]
  ports:
    - 3306:3306
  environment:
    - MYSQL_ROOT_PASSWORD=123456
    - MYSQL_DATABASE=egg_ts_dome

redis:
  image: redis:3.2
  container_name: redis-server-dev
  ports:
    - 6379:6379
  environment:
    - PASSWORD=123456
  volumes:
    - ./redis:/data
```

然后在 `package.json` 的 `scripts` 中添加一些方便启动的命令

``` json
{
  ...
  "scripts": {
    ...
    "docker-up-dev": "docker-compose -f docker-compose-dev.yml -p egg_ts_dome_dev up -d",
  }
}

```

然后就可以 使用 `yarn run docker-up-dev`