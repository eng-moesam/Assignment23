import { Module } from '@nestjs/common';
import { S3BucketService } from 'src/common/services/s3Bucket/s3.service';
import { SecurityService } from 'src/common/services/security/security.service';
import BrandModel from 'src/models/brand.model';
import CategoryModel from 'src/models/category.model';
import { BrandRepo } from 'src/Repo/brand.repo';
import { CatogeryRepo } from 'src/Repo/category.repo';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
    imports:[BrandModel,CategoryModel],
  controllers: [CategoryController],
  providers: [CategoryService,SecurityService,BrandRepo,S3BucketService,CatogeryRepo]
})
export class CategoryModule {}
