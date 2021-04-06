import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export class ListQuery {

  @Field(() => Int, { defaultValue: 25 })
  limit?: number;

  @Field(() => Int, { defaultValue: 1 })
  page?: number;

  @Field({ nullable: true })
  where?: string;

  // helpers - index calculations
  get offset(): number {
    const { page = 1, limit = 25 } = this;
    return (page - 1) * limit;
  }
  get filter(): any {
    const { where } = this;
    if (where) {
      try {
        return JSON.parse(where);
      } catch (error) {
        console.error(error);
      }
    }
    return {};
  }
}
