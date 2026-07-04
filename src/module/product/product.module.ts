import { Module } from '@nestjs/common';
import { S3BucketService } from 'src/common/services/s3Bucket/s3.service';
import { SecurityService } from 'src/common/services/security/security.service';
import BrandModel from 'src/models/brand.model';
import CategoryModel from 'src/models/category.model';
import ProductModel from '../../models/product.model';
import { BrandRepo } from 'src/Repo/brand.repo';
import { CatogeryRepo } from 'src/Repo/category.repo';
import { ProductRepo } from 'src/Repo/product.repo';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { SubCatogeryRepo } from 'src/Repo/subCategory.repo';
import SubCategoryModel from 'src/models/subCategory.model';

@Module({
    imports:[BrandModel,CategoryModel,SubCategoryModel,ProductModel],
  controllers: [ProductController],
  providers: [ProductService,SecurityService,BrandRepo,S3BucketService,CatogeryRepo,SubCatogeryRepo,ProductRepo]
})
export class ProductModule {}
