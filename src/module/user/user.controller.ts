import { Body, Controller, Get, Post, UploadedFile, UploadedFiles, UseInterceptors, UsePipes } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/common/decorator/auth.decorator';
import { User } from 'src/common/decorator/user.decorator';
import type { IHUser } from 'src/models/user.model';
import type{ Express } from 'express';
import { memoryStorage } from 'multer';
import { allowedFileFormates, FileFormatValidationPipe } from 'src/common/pipe/fileValidation.pipe';
import { multerOptions } from 'src/common/utils/multer.config';
import { StorageApproachEnum } from 'src/common/enums/multer.enums';
import { UserService } from './user.service';
import th from 'zod/v4/locales/th.js';
@Controller('user')
export class UserController {
      constructor(private userService:UserService){}
    @Auth()
    @Get()
    getProfile(@User() user:IHUser){
           return {user:user}
    }



    @Auth()
    // @UsePipes(new FileFormatValidationPipe(allowedFileFormates.img))
    // @UseInterceptors(FileInterceptor('profilePic',multerOptions({storageApporach:StorageApproachEnum.Disk})))
    @Post("upload-profile-pic")
   async uploadProfilePic(@Body() body:any,@User() user:IHUser){

        const result= await this.userService.uploadProfilePic(user,body)
                 return result
    }

    @Auth()
    // @UsePipes(new FileFormatValidationPipe(allowedFileFormates.img))
    @UseInterceptors(FilesInterceptor('covPic',4,multerOptions({storageApporach:StorageApproachEnum.Disk})))
    @Post("upload-cov-pic")
   async uploadCovPic(@UploadedFiles() files:any,@User() user:IHUser){

        const result= await this.userService.uploadcovPic(files,user)
                //  return file

                return result
    }
} 

