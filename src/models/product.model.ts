import {  Types, UpdateQuery, model, type HydratedDocument } from 'mongoose';
import  { GenderEnum, ProviderEnum, RoleEnum } from "../common/enums/enums.user"
// import { hashOperation } from '../Common/Security/hash.js';
// import { encryptValue } from '../Common/Security/encryption.js';
// import mailService from "../../Common/Email/email.service.js"
// import { EmailEnum } from '../Common/enums/email.enums.js';
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
 import {AuthService} from "../module/auth/auth.service"
import { AuthModule } from 'src/module/auth/auth.module';
import { SecurityService } from '../common/services/security/security.service';
import { SecurityModule } from '../common/services/security/security.module';
import  slugify  from 'slugify';
import { User } from './user.model';
import { Category } from './category.model';
import { Brand } from './brand.model';
import { SubCategory } from './subCategory.model';

// 1. Create an interface representing a document in MongoDB.
export interface IProduct { 
    name: string;
    slug:string;
    slogan?:string;
    image:string;
    description:string;
    createdBy:Types.ObjectId;
    deletedBy?:Types.ObjectId;
    updatedBy?:Types.ObjectId;
    deletedAt: Date;
    categoryId:Types.ObjectId;
    subCategoryId:Types.ObjectId;
    brands:Types.ObjectId;
    subImages:string[];
    rateAvg:number;
    rateNum:number;
    stock:number;
    discount:number;
    price:number;
    mainPrice:number;

}

export type IHProduct = HydratedDocument<IProduct>;

// 2. Create a Schema corresponding to the document interface.


@Schema({
    timestamps:true,
    strictQuery:true,

})
export class Product{
 @Prop({ type: String, required: true ,unique:true})
  name!: string;

  
    @Prop({ type: String,
         default:function(this:Product){
            return slugify(this.name,{replacement:"_",trim:true,lower:true})
         }
    })
  slug!: string;
   @Prop({ type: String, required: true })
  description!: string;
   @Prop({ type: Number, required: true })
  price!: number;
   @Prop({ type: Number })
  mainPrice?: number;
   @Prop({ type: Number })
  discount!: number;
  @Prop({ type: Number, required: true })
 stock!: number;
  @Prop({ type: Number,  })
 rateNum!: number;
  @Prop({ type: Number,  })
 rateAvg!: number;
  
  @Prop({ type: String, required: true })
    image!: string;
  @Prop({ type: [String],  })
    subImages!: string[];
   @Prop({
    type:Types.ObjectId,ref:Brand.name,
   })
    brands!:Types.ObjectId
   @Prop({
    type:Types.ObjectId,ref:Category.name,
   })
    categoryId!:Types.ObjectId
   @Prop({
    type:Types.ObjectId,ref:SubCategory.name,
   })
    subCategoryId!:Types.ObjectId
   @Prop({type:Types.ObjectId,ref:"User",required:true})
   createdBy!:Types.ObjectId
   @Prop({type:Types.ObjectId,ref:"User"})
   deletedBy!:Types.ObjectId
   @Prop({type:Types.ObjectId,ref:"User"})
   updatedBy!:Types.ObjectId
    @Prop({ type: Date})
    deletedAt!:Date;
}
const ProductSchema = SchemaFactory.createForClass(Product)

const ProductModel = MongooseModule.forFeatureAsync([{
  name: Product.name,
  useFactory() {
  
    ProductSchema.pre(["findOneAndUpdate","updateOne"],function(){
               const updated=  this.getUpdate() as UpdateQuery<Product>
                 if(updated?.name){
                  updated.slug=slugify(updated.name,{replacement:"_",trim:true,lower:true})
                 }
    })
    ProductSchema.pre(["findOne","find","countDocuments"], function () {
      const query = this.getQuery();
      if (!query.getSoftDelete) {
        this.setQuery({...query, deletedAt: {$exists: false}});
      }
    });

    return ProductSchema;
  },
}]);

export default ProductModel