import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, Express } from "express";
import { graphqlHTTP } from "express-graphql";
import morgan from "morgan";
import cors from "cors";

import CarModel from "./database/models/car.model";
import { schema } from "./graphQL/schema";
import UserModel from "./database/models/user.model";
import sequelize from "./database/sequelize";
import { verifyToken } from "./database/dbHelpers";

const app: Express = express();

const port = process.env.PORT;

app.use(cors());

app.use(express.json());

app.use(morgan("dev"));

app.use(verifyToken);

app.use(
  "/api",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.get("/", (req: Request, res: Response) => {
  res.json({ msg: "Working" });
});

app.listen(port, async () => {
  try {
    await sequelize.authenticate();

    const cars = await CarModel.findAll();
    const users = await UserModel.findAll();

    console.log("No of cars inserted ", cars.length);
    console.log("No of Users Present ", users.length);

    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
