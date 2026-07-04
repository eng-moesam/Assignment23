import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatBrandDto, IdDto, QueryBrandDto, UpdateBrandDto } from './dto/brand.dto';
import type{ IHUser } from 'src/models/user.model';
import { BrandRepo } from 'src/Repo/brand.repo';
import { S3BucketService } from 'src/common/services/s3Bucket/s3.service';
import { Types } from 'mongoose';
import { User } from 'src/common/decorator/user.decorator';

@Injectable()
export class BrandService {
    constructor(private _brandRepo:BrandRepo,private _s3BucketService:S3BucketService){}

    async createBrand(body:CreatBrandDto,file:Express.Multer.File,user:IHUser){
        const{name,slogan}=body;
     
        const brand = await this._brandRepo.findOne({filter:{name}})

        if(brand){
            throw new ConflictException("brand already exist")
        }
  
      const url=  await this._s3BucketService.uploadFile({file,path:`brand/${user._id}`} )


          const createBrand= await this._brandRepo.create({data:
           {
            name,
            slogan,
            createdBy:user._id,
            logo:url,
           } 
         })

         if(!createBrand){
            await this._s3BucketService.DeleteFile(url)
         }

         return createBrand
        
    }
    async UpdateBrand(body:UpdateBrandDto,id:Types.ObjectId,user:IHUser){
        const{name,slogan}=body;
     
        const brand = await this._brandRepo.findOne({filter:{_id:id}})

        if(!brand){
            throw new ConflictException("brand not exist")
        }
        if(name && name == brand.name){
            throw new ConflictException("name not change please make any change to update it")
        }
        if(brand && await this._brandRepo.findOne({filter:{name}})){
            throw new ConflictException("this name of brand already  exist")
        }
  


          const updateBrand= await this._brandRepo.findOneAndUpdate({filter:{_id:brand._id},update:{
            ...name?{name}:undefined
            ,...slogan?{slogan}:undefined
            // name,
            // slogan
          
        },
         options:{returnDocument:"after"}})

        

         return updateBrand
        
    }
    async GetAllBrands(query:QueryBrandDto){
        const {page,limit,search} = query
    //     const filter = search?{$or:[
    //     {name:{$regex:search,$options:"i"}},
    //     {slogan:{$regex:search,$options:"i"}}
    //    ]}:{}
       const brands = await this._brandRepo.paginate({filter:search?{$or:[
        {name:{$regex:search,$options:"i"}},
        {slogan:{$regex:search,$options:"i"}}
       ]}:{},page,size:limit}) 
   
       return brands
        
    }
   
     async DeleteBrandsById(id:Types.ObjectId,user:IHUser){
        
        const brand = await this._brandRepo.findOne({filter:{_id:id,createdBy:user._id}})

        if(!brand){
           throw new NotFoundException("not found this brand")
        }
        await this._s3BucketService.DeleteFile(brand.logo)

        const deleteBrand = await this._brandRepo.deleteOne({filter:{_id:id}})

        return deleteBrand

     }
     async softDeleteBrandsById(id:Types.ObjectId,user:IHUser){
        
        const brand = await this._brandRepo.findOne({filter:{_id:id,createdBy:user._id}})

        if(!brand){
           throw new NotFoundException("not found this brand")
        }
        // await this._s3BucketService.DeleteFile(brand.logo)

        const softdeleteBrand = await this._brandRepo.findOneAndUpdate({filter:{_id:id},update:{deletedAt:Date.now(),deletedBy:user._id},options:{returnDocument:"after"}})

        return softdeleteBrand

     }
    // create
    // update 
    // getall paginate search
    // delete
    // softDelete 
}
