import type { Model, ObjectId } from "mongoose";
import DBRepo from "./dbrepo.js";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { Category } from "../models/category.model.js";


@Injectable()
export  class CatogeryRepo extends DBRepo<Category>{
    constructor(@InjectModel(Category.name) CategoryModel:Model<Category>){
        super(CategoryModel)
    }
    public async checkCategoryExists(id:ObjectId):Promise<boolean>{
        return await this.findOne({filter:{_id:id}}) !==null
    }
}

