import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { IHUser } from "src/models/user.model";


export interface IRequestAuth extends Request{
    user:IHUser;
    payload:JwtPayload
}