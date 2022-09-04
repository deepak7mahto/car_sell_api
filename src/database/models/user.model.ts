import { Column, Model, Table } from "sequelize-typescript";

@Table
class UserModel extends Model {
  @Column({ allowNull: false, autoIncrement: true, primaryKey: true })
  id!: number;

  @Column({ allowNull: false }) name!: string;

  @Column({ allowNull: false, unique: true }) userName!: string;

  @Column({ allowNull: false }) passwordHash!: string;
}

export default UserModel;
