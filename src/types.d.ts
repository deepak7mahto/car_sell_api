declare namespace Express {
  export interface Request {
    user: any;
    isAuth: boolean;
  }
  export interface Response {
    user: any;
  }
}
