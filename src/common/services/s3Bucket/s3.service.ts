import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3, S3Client } from "@aws-sdk/client-s3"
import { randomUUID } from "node:crypto";
import { Upload } from "@aws-sdk/lib-storage";
import { StorageApproachEnum } from "../../enums/multer.enums.js";
import { createReadStream } from "node:fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class S3BucketService {
    private REGION!:string;
    private ACCESS_KEY_ID!:string;
    private SECRET_ACCESS_KEY!:string;
    private BUCKET_NAME!:string;
    private APPLICATION_NAME!:string;
    private _clinet !:S3Client;
    constructor(private _configService:ConfigService){
        this.REGION=_configService.get<string>("REGION") as string
        this.ACCESS_KEY_ID=_configService.get<string>("ACCESS_KEY_ID") as string
        this.SECRET_ACCESS_KEY=_configService.get<string>("SECRET_ACCESS_KEY") as string
        this.BUCKET_NAME=_configService.get<string>("BUCKET_NAME") as string
        this.APPLICATION_NAME=_configService.get<string>("APPLICATION_NAME") as string
        this._clinet=new S3Client({
        region: this.REGION,
        credentials: {
            accessKeyId: this.ACCESS_KEY_ID,
            secretAccessKey: this.SECRET_ACCESS_KEY
        }
    })
    }
    async uploadFile({ file, path }: { file: Express.Multer.File, path: string }) {
        const command = new PutObjectCommand({
            Bucket: this.BUCKET_NAME,
            Key: `${this.APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: ObjectCannedACL.private,

        })
        // console.log(command);

        await this._clinet.send(command)
        return command.input.Key!
    }
    async createPresignedUploadFile({ originalname,ContentType, path }: { originalname:string,ContentType:string, path: string }) {
        const command = new PutObjectCommand({
            Bucket: this.BUCKET_NAME,
            Key: `${this.APPLICATION_NAME}/${path}/${randomUUID()}_${originalname}`,
            // Body: file.buffer,
            ContentType,
            ACL: ObjectCannedACL.private,

        })

        const url = await getSignedUrl(this._clinet, command, { expiresIn: 3600 })
        return { key: command.input.Key!, url }
    }
   

    async uploadLargeFile({ file, path, uploadApproach = StorageApproachEnum.Disk }: { file: Express.Multer.File, path: string, uploadApproach?: StorageApproachEnum }) {
        const command = new Upload({
            client: this._clinet,
            params: {
                Bucket: this.BUCKET_NAME,
                Key: `${this.APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
                Body: uploadApproach == StorageApproachEnum.Memory ? file.buffer : createReadStream(file.path),
                ContentType: file.mimetype
            },
            // partSize:1024*1024*5
        });
        command.on("httpUploadProgress", (progress) => {
            console.log(`file uploading${((progress.loaded as number) / (progress.total as number)) * 100} %`);

        })

        const uploadedFile = await command.done()
        return uploadedFile.Key as string
    }

    async uploadFiles({ files, path, uploadApproach = StorageApproachEnum.Disk }: { files: Express.Multer.File[], path: string, uploadApproach?: StorageApproachEnum }) {


        const Keys = await Promise.all(
            files.map((file) => {
                return uploadApproach == StorageApproachEnum.Memory ?
                    this.uploadFile({ file, path }) :
                    this.uploadLargeFile({ file, path, uploadApproach: StorageApproachEnum.Disk })
            })
        )
        return Keys
    }

    async createPresignedGetFile({Key,filename,download}:{Key:string,filename?:string,download?:string}){
      const command = new GetObjectCommand({
        Bucket:this.BUCKET_NAME,
        Key,
        ResponseContentDisposition:download=="true"? `attachment; filename=${filename}`:undefined
      })
      return await getSignedUrl(this._clinet, command, { expiresIn: 3600 })
   }
    async getFile(Key:string){
      const command = new GetObjectCommand({
        Bucket:this.BUCKET_NAME,
        Key
      })
      return await this._clinet.send(command)
   }
   async DeleteFile(Key:string){
    const command = new DeleteObjectCommand({
        Bucket:this.BUCKET_NAME,
        Key
    })
   return await this._clinet.send(command)
   }
   async DeleteFiles(Keys:{Key:string}[]){
    const command = new DeleteObjectsCommand({
        Bucket:this.BUCKET_NAME,
        Delete:{Objects:Keys}
    })
   return await this._clinet.send(command)
   }

   async listFoldersKeys(Prefix:string){
    const command = new ListObjectsV2Command({
        Bucket:this.BUCKET_NAME,
        Prefix:`${this.APPLICATION_NAME}/${Prefix}`
    })
    return await this._clinet.send(command)
   }
}


