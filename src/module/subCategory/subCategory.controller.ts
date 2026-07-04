import { Body, Controller, Delete, Get, Param, ParseFilePipe, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/common/decorator/auth.decorator';
import { User } from 'src/common/decorator/user.decorator';
import { RoleEnum } from 'src/common/enums/enums.user';
import { multerOptions } from 'src/common/utils/multer.config';
import type { IHUser } from 'src/models/user.model';
import { CreatSubCategoryDto, IdDto, QuerySubCategoryDto, UpdateSubCategoryDto } from './dto/subCategory.dto';
import { SubCategoryService } from './subCategory.service';

@Controller('subCategory')
export class SubCategoryController {
    constructor(private readonly _subCategoryService:SubCategoryService){}
@Post()
@Auth({role:[RoleEnum.User]})
@UseInterceptors(FileInterceptor("image",multerOptions()))
async createSubCategory( @Body() body:CreatSubCategoryDto,@UploadedFile(ParseFilePipe) file:Express.Multer.File,@User() user:IHUser){
      return await this._subCategoryService.createSubCategory(body,file,user)
}


@Patch("/:id")
@Auth()
async UpdateSubCategory( @Param()params:IdDto,@Body() body:UpdateSubCategoryDto,@User() user:IHUser){
      return await this._subCategoryService.UpdateSubCategory(body,params.id,user)
}

@Get()
async GetAllSubCategories(@Query() query:QuerySubCategoryDto ){
  return await this._subCategoryService.GetAllSubCategories(query)
}

@Auth()
@Delete("/softDelete/:id")
async softDeleteSubCategoryById(@Param() params:IdDto ,@User() user:IHUser){
      return await this._subCategoryService.softDeleteSubCategoryById(params.id,user)
}
@Auth()
@Delete("/:id")
async DeleteSubCategoryById(@Param() params:IdDto ,@User() user:IHUser){
      return await this._subCategoryService.DeleteSubCategoryById(params.id,user)
}

}
