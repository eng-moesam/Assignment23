import { Types, UpdateQuery, type HydratedDocument } from 'mongoose';
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import slugify from 'slugify';
import { User } from './user.model';
import { Brand } from './brand.model';

// 1. Create an interface representing a document in MongoDB.
export interface ICategory { 
    name: string;
    slug:string;
    slogan?:string;
    logo:string;
    createdBy:Types.ObjectId;
    deletedBy?:Types.ObjectId;
    updatedBy?:Types.ObjectId;
    deletedAt: Date;
}

export type IHCategory = HydratedDocument<ICategory>;

// 2. Create a Schema corresponding to the document interface.


@Schema({
    timestamps:true,
    strictQuery:true,
})
export class Category{
    @Prop({ type: String, required: true ,unique:true})
  name!: string;

  
    @Prop({ type: String,
         default:function(this:Category){
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
   @Prop({type:Types.ObjectId,ref:"User",required:true})
   createdBy!:Types.ObjectId
   @Prop({type:Types.ObjectId,ref:"User"})
   deletedBy!:Types.ObjectId
   @Prop({type:Types.ObjectId,ref:"User"})
   updatedBy!:Types.ObjectId
    @Prop({ type: Date})
    deletedAt!:Date;
}
const CategorySchema = SchemaFactory.createForClass(Category)

const CategoryModel = MongooseModule.forFeatureAsync([{
  name: Category.name,
  useFactory() {
  
    CategorySchema.pre(["findOneAndUpdate","updateOne"],function(){
               const updated=  this.getUpdate() as UpdateQuery<Category>
                 if(updated?.name){
                  updated.slug=slugify(updated.name,{replacement:"_",trim:true,lower:true})
                 }
    })
    CategorySchema.pre(["findOne","find","countDocuments"], function () {
      const query = this.getQuery();
      if (!query.getSoftDelete) {
        this.setQuery({...query, deletedAt: {$exists: false}});
      }
    });

    return CategorySchema;
  },
}]);

export default CategoryModel