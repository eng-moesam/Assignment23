import { Body, Controller, Delete, Get, Param, ParseFilePipe, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BrandService } from './brand.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/utils/multer.config';
import { Auth } from 'src/common/decorator/auth.decorator';
import { RoleEnum } from 'src/common/enums/enums.user';
import { User } from 'src/common/decorator/user.decorator';
import type{ IHUser } from 'src/models/user.model';
import { CreatBrandDto, IdDto, QueryBrandDto, UpdateBrandDto } from './dto/brand.dto';

@Controller('brand')
export class BrandController {
    constructor(private readonly _brandService:BrandService){}
@Post()
@Auth({role:[RoleEnum.User]})
@UseInterceptors(FileInterceptor("logo",multerOptions()))
async createBrand( @Body() body:CreatBrandDto,@UploadedFile(ParseFilePipe) file:Express.Multer.File,@User() user:IHUser){
  try {
    
      return await this._brandService.createBrand(body,file,user)
  } catch (error) {
    console.log(error);
    
  }
}



@Patch("/:id")
@Auth({role:[RoleEnum.User]})
async UpdateBrand( @Param()params:IdDto,@Body() body:UpdateBrandDto,@User() user:IHUser){
    
      return await this._brandService.UpdateBrand(body,params.id,user)
  
}


@Get()
async GetAllBrands(@Query() query:QueryBrandDto ){
    
  return await this._brandService.GetAllBrands(query)
  
}
@Auth()
@Delete("/softDelete/:id")
async softDeleteBrandsById(@Param() params:IdDto ,@User() user:IHUser){
    
      return await this._brandService.softDeleteBrandsById(params.id,user)
  
}
@Auth()
@Delete("/:id")
async DeleteBrandsById(@Param() params:IdDto ,@User() user:IHUser){
    
      return await this._brandService.DeleteBrandsById(params.id,user)
  
}


}
