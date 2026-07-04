import { PartialType } from "@nestjs/mapped-types"
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length } from "class-validator"
import { Types } from "mongoose"
import { AtLeastOne } from "../../../common/validation/brand.validation"
import { Type } from "class-transformer"

export class CreatBrandDto {
    @IsNotEmpty()
    @IsString()
    @Length(3,50)
    name!:string
     @IsNotEmpty()
    @IsString()
    @Length(3,200)
    slogan!:string
}


@AtLeastOne(["name","slogan"])
export class UpdateBrandDto extends PartialType(CreatBrandDto) {
   
}
export class IdDto {
   @IsNotEmpty()
   @IsMongoId()
   id!:Types.ObjectId
}


export class QueryBrandDto{
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