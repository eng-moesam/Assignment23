import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { S3BucketService } from 'src/common/services/s3Bucket/s3.service';
import type { IHUser } from 'src/models/user.model';
import { BrandRepo } from 'src/Repo/brand.repo';
import { CatogeryRepo } from 'src/Repo/category.repo';
import { SubCatogeryRepo } from 'src/Repo/subCategory.repo';
import { CreatSubCategoryDto, QuerySubCategoryDto, UpdateSubCategoryDto } from './dto/subCategory.dto';

@Injectable()
export class SubCategoryService {
    constructor(private _brandRepo:BrandRepo,private _s3BucketService:S3BucketService,private _categoryRepo:CatogeryRepo,private _subCategoryRepo:SubCatogeryRepo){}

    async createSubCategory(body:CreatSubCategoryDto,file:Express.Multer.File,user:IHUser){
        const{name,brands,categoryId}=body;
       
     const category = await this._categoryRepo.findById({id:categoryId})

       if(!category) throw new ConflictException("this Catogery Not exist")

     const   subcategory = await this._subCategoryRepo.findOne({filter:{name,categoryId}})

     if(subcategory) throw new ConflictException("this subCatogery already exist")
    
        const strictIds = ([... new Set(brands || [])] as any).map(id=>Types.ObjectId.createFromHexString(id))
      if(brands &&( await this._brandRepo.find({filter:{_id:{$in:brands}}})).length != strictIds.length){

        throw new NotFoundException("som of id not found")
      }

      const image = await this._s3BucketService.uploadFile({file,path:`SubCategory/${user._id}`})
        
        const createSubCategory = await this._subCategoryRepo.create({data:{
            name,
            brands:strictIds,
            image,
            categoryId,
            createdBy:user._id
        }})

        return createSubCategory
    }

    async UpdateSubCategory(body:UpdateSubCategoryDto,id:Types.ObjectId,user:IHUser){
      const {name,brands,categoryId} = body

      const subCategory = await this._subCategoryRepo.findOne({filter:{_id:id,createdBy:user._id}})

     if(!subCategory) throw new ConflictException("this subCatogery not exist")

      if(name && name == subCategory.name){
        throw new ConflictException("this name already exsit in subCategories name")
      }

      if(categoryId){
        const category = await this._categoryRepo.findById({id:categoryId})
        if(!category) throw new NotFoundException("this Catogery Not exist")
      }

      const strictIds = ([... new Set(brands || [])] as any).map(id=>Types.ObjectId.createFromHexString(id))
      if(brands &&( await this._brandRepo.find({filter:{_id:{$in:brands}}})).length != strictIds.length){
        throw new NotFoundException("som of id not found")
      }

      const updatedSubCategories = await this._subCategoryRepo.findOneAndUpdate({filter:{_id:subCategory._id},update:{
        ...(name !== undefined ? {name} : {}),
        ...(categoryId !== undefined ? {categoryId} : {}),
        ...(brands !== undefined ? {brands:strictIds} : {}),
        updatedBy:user._id
      },
    options:{returnDocument:"after"}})
  
    return updatedSubCategories
    }

    async GetAllSubCategories(query:QuerySubCategoryDto){
            const {page,limit,search} = query
      
           const subCategories = await this._subCategoryRepo.paginate({filter:search?
            {name:{$regex:search,$options:"i"}}:{},page,size:limit,options:{
              populate:[{path:"brands"},{path:"categoryId",populate:{path:"brands"}}],
            }}) 
       
           return subCategories
            
        }

     async DeleteSubCategoryById(id:Types.ObjectId,user:IHUser){
        
        const subCategory = await this._subCategoryRepo.findOne({filter:{_id:id,createdBy:user._id}})

        if(!subCategory){
           throw new NotFoundException("not found this subCategory")
        }
        await this._s3BucketService.DeleteFile(subCategory.image)

        const deleteSubCategory = await this._subCategoryRepo.deleteOne({filter:{_id:id}})

        return deleteSubCategory

     }
     async softDeleteSubCategoryById(id:Types.ObjectId,user:IHUser){
        
        const subCategory = await this._subCategoryRepo.findOne({filter:{_id:id,createdBy:user._id}})

        if(!subCategory){
           throw new NotFoundException("not found this subCategory")
        }

        const softdeleteSubCategory = await this._subCategoryRepo.findOneAndUpdate({filter:{_id:id},update:{deletedAt:Date.now(),deletedBy:user._id},options:{returnDocument:"after"}})

        return softdeleteSubCategory

     }
}
