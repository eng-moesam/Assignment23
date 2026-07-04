import { PartialType } from "@nestjs/mapped-types"
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length, Validate } from "class-validator"
import { Types } from "mongoose"
import { AtLeastOne } from "../../../common/validation/brand.validation"
import { Type } from "class-transformer"
import { ValidateId } from "src/common/validation/Category.validation"

export class CreatCategoryDto {
    @IsNotEmpty()
    @IsString()
    @Length(3,50)
    name!:string
   

    @Validate(ValidateId)
    @IsOptional()
    brands!:Types.ObjectId[]
}


@AtLeastOne(["name","brands"])
export class UpdateCategoryDto extends PartialType(CreatCategoryDto) {
   
}
export class IdDto {
   @IsNotEmpty()
   @IsMongoId()
   id!:Types.ObjectId
}


export class QueryCategoryDto{
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