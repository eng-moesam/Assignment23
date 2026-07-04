import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../common/module/shared.module';
import { S3BucketService } from 'src/common/services/s3Bucket/s3.service';

@Module({
    imports:[],
    controllers:[UserController],
    providers:[UserService,S3BucketService]

})
export class UserModule {}
