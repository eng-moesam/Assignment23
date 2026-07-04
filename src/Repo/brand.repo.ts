import type { Model, ObjectId } from "mongoose";
import DBRepo from "./dbrepo.js";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import  { Brand } from "src/models/brand.model";


@Injectable()
export  class BrandRepo extends DBRepo<Brand>{
    constructor(@InjectModel(Brand.name) BrandModel:Model<Brand>){
        super(BrandModel)
    }
    public async checkBrandExists(id:ObjectId):Promise<boolean>{
        return await this.findOne({filter:{_id:id}}) !==null
    }
}

