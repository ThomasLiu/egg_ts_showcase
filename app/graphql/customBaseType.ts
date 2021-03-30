import { GraphQLScalarType } from 'graphql';
import { ArgsType, Field, Int } from 'type-graphql';
import { isObject, isArray } from 'lodash';

/**
  * 验证
*/
function checkIsObject(value: any) {
  if (!(isArray(value) || isObject(value))) {
    throw new Error('亲，参数不是一个对象呢！');
  }
}

export const JsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: '验证 JSON 类型',
  parseValue(value: any) {
    checkIsObject(value);
    return value;
  },
  serialize(value: any) {
    return value;
  },
});

@ArgsType()
export class DefaultQuery {

  @Field(() => JsonScalar, { nullable: true })
  filter: any;

  @Field(() => JsonScalar, { nullable: true })
  order: -1;

  @Field(() => Int, { nullable: true })
  page: number;
}


@ArgsType()
export class WillSaveObj {

  @Field(() => JsonScalar, { nullable: true })
  body: any;

}


@ArgsType()
export class WillUpdateObj {

  @Field(() => JsonScalar, { nullable: true })
  body: any;

  @Field({ nullable: true })
  id: string;

}
