import { Sequelize } from "sequelize-typescript";
import CarModel from "./models/car.model";
import UserModel from "./models/user.model";
import bcrypt from "bcryptjs";

const sequelize: Sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
});

sequelize.addModels([UserModel, CarModel]);

// UserModel.sync();
// CarModel.sync();

UserModel.beforeCreate((model) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(model.passwordHash, salt);
    model.passwordHash = hashedPassword;
  } catch (error) {
    console.log(error);
  }
});

UserModel.hasMany(CarModel, { foreignKey: "addedBy" });
CarModel.belongsTo(UserModel, { foreignKey: "addedBy" });

export default sequelize;
