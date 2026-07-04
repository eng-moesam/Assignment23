import { Injectable} from '@nestjs/common';
import { S3BucketService } from './common/services/s3Bucket/s3.service';
import { promisify } from 'node:util';
import { pipeline } from 'node:stream';

@Injectable()
export class AppService {
  constructor(private _S3BucketService:S3BucketService){}
 async getuploads(path:any) {
    const Key = path.join("/")
    const result = await this._S3BucketService.getFile( Key )
 return result
  }

  async getPreSignedPathService(query:any,path:any){
    const {filename,download} =query
    // const Key = path.join("/")
    
  const Key = Array.isArray(path) ? path.join("/") : path;

        const result = await this._S3BucketService.createPresignedGetFile({ 
          Key,
          filename:filename as string ||
           (path[path.length-1]  )as string,download:download as string} )
       return result
  }
}

