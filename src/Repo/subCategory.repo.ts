import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model, ObjectId } from "mongoose";
import { SubCategory } from "../models/subCategory.model";
import DBRepo from "./dbrepo.js";


@Injectable()
export  class SubCatogeryRepo extends DBRepo<SubCategory>{
    constructor(@InjectModel(SubCategory.name) SubCategoryModel:Model<SubCategory>){
        super(SubCategoryModel)
    }
    public async checkSubCategoryExists(id:ObjectId):Promise<boolean>{
        return await this.findOne({filter:{_id:id}}) !==null
    }
}

