import type { Model, ObjectId } from "mongoose";
import {  User } from "../models/user.model";
import UserModel from "../models/user.model";
import DBRepo from "./dbrepo.js";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";


@Injectable()
export  class UserRepo extends DBRepo<User>{
    constructor(@InjectModel(User.name) userModel:Model<User>){
        super(userModel)
    }
    public async checkUserExists(id:ObjectId):Promise<boolean>{
        return await this.findOne({filter:{_id:id}}) !==null
    }
}

