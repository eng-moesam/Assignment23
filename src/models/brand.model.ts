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

// 1. Create an interface representing a document in MongoDB.
export interface IBrand { 
    name: string;
    slug:string;
    slogan?:string;
    logo:string;

    createdBy:Types.ObjectId;
    deletedBy?:Types.ObjectId;
    updatedBy?:Types.ObjectId;
    deletedAt: Date;

}

export type IHBrand = HydratedDocument<IBrand>;

// 2. Create a Schema corresponding to the document interface.


@Schema({
    timestamps:true,
    strictQuery:true,

})
export class Brand{
    @Prop({ type: String, required: true ,unique:true})
  name!: string;

  
    @Prop({ type: String,
         default:function(this:Brand){
            return slugify(this.name,{replacement:"_",trim:true,lower:true})
         }
    })
  slug!: string;
  @Prop({ type: String, required: true })
    logo!: string;

     @Prop({ type: String})

   slogan!:string
   @Prop({type:Types.ObjectId,ref:"User",required:true})
   createdBy!:Types.ObjectId
   @Prop({type:Types.ObjectId,ref:"User"})
   deletedBy!:Types.ObjectId
   @Prop({type:Types.ObjectId,ref:"User"})
   updatedBy!:Types.ObjectId
    @Prop({ type: Date})
    deletedAt!:Date;
}
const BrandSchema = SchemaFactory.createForClass(Brand)

const BrandModel = MongooseModule.forFeatureAsync([{
  name: Brand.name,
  useFactory() {
  
    BrandSchema.pre(["findOneAndUpdate","updateOne"],function(){
               const updated=  this.getUpdate() as UpdateQuery<Brand>
                 if(updated?.name){
                  updated.slug=slugify(updated.name,{replacement:"_",trim:true,lower:true})
                 }
    })
    BrandSchema.pre(["findOne","find","countDocuments"], function () {
      const query = this.getQuery();
      if (!query.getSoftDelete) {
        this.setQuery({...query, deletedAt: {$exists: false}});
      }
    });

    return BrandSchema;
  },
}]);

export default BrandModel