import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import CarModel from "../database/models/car.model";
import { createUser, loginUser } from "../database/dbHelpers";
import { Request } from "express";

const carType = new GraphQLObjectType({
  name: "car",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLInt), description: "User Id" },
    carMake: { type: GraphQLString, description: "Car Make Details" },
    carModel: { type: GraphQLString, description: "Car Make Details" },
    carYear: { type: GraphQLString, description: "Car Make Details" },
    carPictureUrl: { type: GraphQLString, description: "Car Make Details" },
    carSalePrice: { type: GraphQLInt, description: "Car Sale Price" },
    additionalNotes: { type: GraphQLString, description: "Additional Notes" },
    addedBy: { type: GraphQLString, description: "Added By User Id" },
    sold: { type: GraphQLBoolean, description: "Is Car Sold ?" },
  },
});

const UserRegisterResponseType = new GraphQLObjectType({
  name: "register",
  fields: {
    userName: { type: GraphQLString },
    message: { type: GraphQLString },
  },
});

const UserType = new GraphQLObjectType({
  name: "user",
  fields: {
    userName: { type: GraphQLString },
    name: { type: GraphQLString },
  },
});

const UserLoginResponseType = new GraphQLObjectType({
  name: "login",
  fields: {
    token: { type: GraphQLString },
    message: { type: GraphQLString },
    user: { type: UserType },
  },
});

const AddCarResponseType = new GraphQLObjectType({
  name: "addCar",
  fields: {
    message: { type: GraphQLString },
  },
});

export interface UserLoginObject {
  username: string;
  password: string;
}

export interface UserRegisterObject extends UserLoginObject {
  name: string;
}

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "rootQuery",
    fields: {
      cars: {
        type: new GraphQLList(carType),
        async resolve() {
          try {
            let values = await CarModel.findAll();
            return values;
          } catch (error) {
            console.log(error);
            return [];
          }
        },
      },
      adminCars: {
        type: new GraphQLList(carType),
        async resolve(p1, p2, req: Request, info) {
          if (!req.isAuth) {
            return [];
          }
          try {
            const { id } = req.user;
            let values = await CarModel.findAll({ where: { addedBy: id } });
            return values;
          } catch (error) {
            console.log(error);
            return [];
          }
        },
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: "rootMutation",
    fields: {
      registerUser: {
        type: UserRegisterResponseType,
        args: {
          name: { type: GraphQLString },
          username: { type: GraphQLString },
          password: { type: GraphQLString },
        },
        resolve(source, args) {
          let data: UserRegisterObject = {
            name: args.name,
            username: args.username,
            password: args.password,
          };
          return createUser(data);
        },
      },
      loginUser: {
        type: UserLoginResponseType,
        args: {
          username: { type: GraphQLString },
          password: { type: GraphQLString },
        },
        resolve(source, args) {
          let data: UserLoginObject = {
            username: args.username,
            password: args.password,
          };

          return loginUser(data);
        },
      },
      addAdminCar: {
        type: AddCarResponseType,
        args: {
          carMake: { type: GraphQLString },
          additionalNotes: { type: GraphQLString },
          carModel: { type: GraphQLString },
          carPictureUrl: { type: GraphQLString },
          carSalePrice: { type: GraphQLInt },
          carYear: { type: GraphQLString },
        },
        async resolve(source, args, req: Request) {
          if (!req.isAuth) {
            return { message: "UnAuthorized" };
          }

          const {
            user: { id },
          } = req;

          const {
            carMake,
            carModel,
            carPictureUrl,
            carSalePrice,
            carYear,
            additionalNotes,
          } = args;

          try {
            let carData = CarModel.build({
              carMake,
              carModel,
              carPictureUrl,
              carSalePrice,
              carYear,
              additionalNotes,
              addedBy: id,
            });

            await carData.save();

            return { message: "Data Saved" };
          } catch (error) {
            console.log(error);
            return { message: "Unknown Error" };
          }
        },
      },
    },
  }),
});
