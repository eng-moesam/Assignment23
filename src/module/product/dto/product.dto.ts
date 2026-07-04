import { PartialType } from "@nestjs/mapped-types"
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length, Max, Min, Validate } from "class-validator"
import { Types } from "mongoose"
import { AtLeastOne } from "../../../common/validation/brand.validation"
import { Type } from "class-transformer"

export class CreatProductDto {
    @IsNotEmpty()
    @IsString()
    @Length(3,50)
    name!:string

    @IsNotEmpty()
    @IsString()
    @Length(3,5000)
   description!:string
   
   @IsNotEmpty()
    @IsMongoId()
    brands!:Types.ObjectId
   
   @IsNotEmpty()
    @IsMongoId()
    categoryId!:Types.ObjectId
    @IsNotEmpty()
    @IsMongoId()
    subCategoryId!:Types.ObjectId
    @IsNotEmpty()
    @IsNumber()
    @Type(()=>Number)
    stock!:number
    @IsNotEmpty()
    @IsNumber()
    @Type(()=>Number)
    price!:number
    @Min(1)
    @Max(100)
    @IsNotEmpty()
    @IsNumber()
    @Type(()=>Number)
    @IsOptional()
    discount?:number
   

}

@AtLeastOne(["name","description","brands","categoryId","subCategoryId","stock","price","discount"])
export class UpdateProductDto extends PartialType(CreatProductDto) {
   
}
export class IdDto {
   @IsNotEmpty()
   @IsMongoId()
   id!:Types.ObjectId
}


export class QueryProductDto{
    @IsNotEmpty()
    @IsPositive()
    @IsNumber()
    @IsOptional()
    @Type(()=> Number)
    page?:number
    @IsNotEmpty()
    @IsPositive()
    @IsNumber()
    @IsOptional()
    @Type(()=> Number)

    limit?:number
    
    @IsOptional()
    @IsString()
    search?:string
}
