
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

export const allowedFileFormates ={
    img:["image/png","image/jbg","image/jpeg"],
    video:["video/mp4",'video/mkv']
}





@Injectable()
export class FileFormatValidationPipe implements PipeTransform {
    constructor(private allowedFormates:string[]){}
  transform(value: any, metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
   
    if(!this.allowedFormates.includes(value.mimetype)){
        throw new BadRequestException("invalid file Type")
    }


    return true
  }
}
