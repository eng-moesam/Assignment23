import { Body, Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type{ Express, Response } from 'express';
import { S3BucketService } from './common/services/s3Bucket/s3.service';
import { promisify } from 'node:util';
import { pipeline } from 'node:stream';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService ) {}

  @Get("uploads/*path")
 async getUploadsPath(@Param("path") path:any,@Query()query:any,@Res() res:Response) {
       const {filename,download} =query

       const result = await this.appService.getuploads(path)

       const pipleLineStreamRead = promisify(pipeline)
    if(download == "true"){
       res.setHeader("content-disposition",`attachment; filename=${filename  || path[path.length-1]}`)
    }
    await pipleLineStreamRead(result.Body as NodeJS.ReadableStream, res)
 
  }
  @Get("pre-signed-upload/*path")
 async getPreSignedPath(@Query()query:any,@Param("path") path:any) {
    const result = await this.appService.getPreSignedPathService(query,path)
    return result
 
  }


}
