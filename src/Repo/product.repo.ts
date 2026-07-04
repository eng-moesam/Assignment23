import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model, ObjectId } from "mongoose";
import { Product } from "../models/product.model";
import DBRepo from "./dbrepo.js";


@Injectable()
export  class ProductRepo extends DBRepo<Product>{
    constructor(@InjectModel(Product.name) ProductModel:Model<Product>){
        super(ProductModel)
    }
    public async checkProductExists(id:ObjectId):Promise<boolean>{
        return await this.findOne({filter:{_id:id}}) !==null
    }
}

