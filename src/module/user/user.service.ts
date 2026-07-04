import { Injectable } from "@nestjs/common";
import { S3BucketService } from "src/common/services/s3Bucket/s3.service";
import { IHUser } from "src/models/user.model";

@Injectable()
export class UserService{
constructor(private _S3BucketService:S3BucketService){}
 async uploadProfilePic( user: IHUser,bodyData:any) {
      // const Key = await this._S3BuketServise.uploadFile({ file, path: `user/${user._id}/profilrPic` })
      const {originalname,ContentType}=bodyData
      const Key = await this._S3BucketService.createPresignedUploadFile({ originalname,ContentType, path: `user/${user._id}/profilrPic` })
      if(user.profilePic){
         await this._S3BucketService.DeleteFile(user.profilePic)
      }
      // user.profilePic = Key.key
      // await user.save()

      return Key

   }

   async uploadcovPic(files: Express.Multer.File[], user: IHUser) {
      // const Key=  await this._S3BucketService.uploadFile({file,path:"user"})


      const Key = await this._S3BucketService.uploadFiles({ files, path: `user/${user._id}/covPic` })

      user.covPic = Key
      await user.save()
      return Key

   }
    

}