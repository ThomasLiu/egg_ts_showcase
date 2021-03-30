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
