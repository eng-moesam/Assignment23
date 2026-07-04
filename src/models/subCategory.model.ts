import { Types, UpdateQuery, type HydratedDocument } from 'mongoose';
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import slugify from 'slugify';
import { User } from './user.model';
import { Brand } from './brand.model';
import { Category } from './category.model';

// 1. Create an interface representing a document in MongoDB.
export interface ISubCategory { 
    name: string;
    slug:string;
    slogan?:string;
    logo:string;
    brands:Types.ObjectId[]
    categoryId:Types.ObjectId;
    createdBy:Types.ObjectId;
    deletedBy?:Types.ObjectId;
    updatedBy?:Types.ObjectId;
    deletedAt: Date;
}

export type IHSubCategory = HydratedDocument<ISubCategory>;

// 2. Create a Schema corresponding to the document interface.


@Schema({
    timestamps:true,
    strictQuery:true,
})
export class SubCategory{
    @Prop({ type: String, required: true ,unique:true})
  name!: string;

  
    @Prop({ type: String,
         default:function(this:SubCategory){
            return slugify(this.name,{replacement:"_",trim:true,lower:true})
         }
    })
  slug!: string;
  @Prop({ type: String, required: true })
    image!: string;
   @Prop({
    type:[Types.ObjectId],ref:Brand.name,
   })
    brands!:Types.ObjectId[]
   @Prop({
    type:Types.ObjectId,ref:Category.name,
   })
    categoryId!:Types.ObjectId

   @Prop({type:Types.ObjectId,ref:"User",required:true})
   createdBy!:Types.ObjectId
   @Prop({type:Types.ObjectId,ref:"User"})
   deletedBy!:Types.ObjectId
   @Prop({type:Types.ObjectId,ref:"User"})
   updatedBy!:Types.ObjectId
    @Prop({ type: Date})
    deletedAt!:Date;
}
const SubCategorySchema = SchemaFactory.createForClass(SubCategory)

const SubCategoryModel = MongooseModule.forFeatureAsync([{
  name: SubCategory.name,
  useFactory() {
  
    SubCategorySchema.pre(["findOneAndUpdate","updateOne"],function(){
               const updated=  this.getUpdate() as UpdateQuery<SubCategory>
                 if(updated?.name){
                  updated.slug=slugify(updated.name,{replacement:"_",trim:true,lower:true})
                 }
    })
    SubCategorySchema.pre(["findOne","find","countDocuments"], function () {
      const query = this.getQuery();
      if (!query.getSoftDelete) {
        this.setQuery({...query, deletedAt: {$exists: false}});
      }
    });

    return SubCategorySchema;
  },
}]);

export default SubCategoryModel