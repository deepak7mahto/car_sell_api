import { Column, Model, Table } from "sequelize-typescript";
import UserModel from "./user.model";

@Table({ tableName: "Cars" })
class CarModel extends Model {
  @Column({ allowNull: false, autoIncrement: true, primaryKey: true })
  id!: number;

  @Column({ allowNull: false }) carMake!: string;

  @Column({ allowNull: false }) carModel!: string;

  @Column({ allowNull: false }) carYear!: string;

  @Column({ allowNull: false }) carPictureUrl!: string;

  @Column({ allowNull: false }) carSalePrice!: number;

  @Column({ allowNull: false }) additionalNotes!: string;

  @Column addedBy!: number;

  @Column({ allowNull: false, defaultValue: false }) sold!: boolean;
}

export default CarModel;
