import { PartialType } from "@nestjs/mapped-types"
import { Type } from "class-transformer"
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length, Validate } from "class-validator"
import { Types } from "mongoose"
import { AtLeastOne } from "src/common/validation/brand.validation"
import { ValidateId } from "src/common/validation/Category.validation"

export class CreatSubCategoryDto {
    @IsNotEmpty()
    @IsString()
    @Length(3,50)
    name!:string

    @IsNotEmpty()
    @IsMongoId()
    categoryId!:Types.ObjectId
    
    @Validate(ValidateId)
    @IsOptional()
    brands?:Types.ObjectId[]


}


@AtLeastOne(["name","brands","categoryId"])
export class UpdateSubCategoryDto extends PartialType(CreatSubCategoryDto) {
   
}
export class IdDto {
   @IsNotEmpty()
   @IsMongoId()
   id!:Types.ObjectId
}


export class QuerySubCategoryDto{
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