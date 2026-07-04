import { Module } from '@nestjs/common';
import { S3BucketService } from 'src/common/services/s3Bucket/s3.service';
import { SecurityService } from 'src/common/services/security/security.service';
import BrandModel from 'src/models/brand.model';
import CategoryModel from 'src/models/category.model';
import SubCategoryModel from 'src/models/subCategory.model';
import { BrandRepo } from 'src/Repo/brand.repo';
import { CatogeryRepo } from 'src/Repo/category.repo';
import { SubCatogeryRepo } from 'src/Repo/subCategory.repo';
import { SubCategoryController } from './subCategory.controller';
import { SubCategoryService } from './subCategory.service';

@Module({
    imports:[BrandModel,CategoryModel,SubCategoryModel],
  controllers: [SubCategoryController],
  providers: [SubCategoryService,SecurityService,BrandRepo,S3BucketService,CatogeryRepo,SubCatogeryRepo]
})
export class SubCategoryModule {}
