import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { SecurityService } from 'src/common/services/security/security.service';
import { BrandRepo } from 'src/Repo/brand.repo';
import BrandModel from 'src/models/brand.model';
import { S3BucketService } from 'src/common/services/s3Bucket/s3.service';

@Module({
    imports:[BrandModel],
  controllers: [BrandController],
  providers: [BrandService,SecurityService,BrandRepo,S3BucketService]
})
export class BrandModule {}
