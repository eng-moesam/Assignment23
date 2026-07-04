import multer, { FileFilterCallback } from "multer";
import { StorageApproachEnum } from "../enums/multer.enums"
import { allowedFileFormates } from "../pipe/fileValidation.pipe";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { BadRequestException } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";


export function fileFilter(allowedFormates:string[]){
    return(req:Request,file:Express.Multer.File,cb: (error: Error | null, acceptFile: boolean)=>void)=>{
    
    if(!allowedFormates.includes(file.mimetype)){
        return cb(new BadRequestException("invalid format"),false)
    }
    return cb(null,true)
        
  }}

export function multerOptions({storageApporach=StorageApproachEnum.Memory,allowedFormates=allowedFileFormates.img,fileSize=5}:{
storageApporach?:StorageApproachEnum;
allowedFormates?:string[];
fileSize?:number
}={}):MulterOptions{



     const storage =storageApporach==StorageApproachEnum.Memory? multer.memoryStorage()
    : multer.diskStorage({
       destination(req, file, callback) {
          callback(null,tmpdir()) 
       },
       filename(req, file, callback) {
           callback(null,`${randomUUID()}_${file.originalname}`)
       },
    })

    // return multer({storage,limits:{fileSize:fileSize*1024*1024}})
 
  return  {storage,
     fileFilter:fileFilter(allowedFormates)
    ,limits:{fileSize:fileSize*1024*1024}}
}