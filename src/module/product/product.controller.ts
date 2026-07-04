import { Body, Controller, Delete, Get, Param, ParseFilePipe, Patch, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/common/decorator/auth.decorator';
import { User } from 'src/common/decorator/user.decorator';
import { RoleEnum } from 'src/common/enums/enums.user';
import { multerOptions } from 'src/common/utils/multer.config';
import type { IHUser } from 'src/models/user.model';
import { CreatProductDto, IdDto, QueryProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
    constructor(private readonly _productService:ProductService){}
@Post()
@Auth({role:[RoleEnum.User]})
@UseInterceptors(FileFieldsInterceptor([{name:"image",maxCount:1},{name:"subImages",maxCount:5}],multerOptions()))
async createProduct( @Body() body:CreatProductDto,@UploadedFiles(ParseFilePipe) files:{image:Express.Multer.File[],subImages:Express.Multer.File[]},@User() user:IHUser){
      return await this._productService.createProduct(body,files,user)
}

@Patch("/:id")
@Auth()
async UpdateProduct( @Param()params:IdDto,@Body() body:UpdateProductDto,@User() user:IHUser){
      return await this._productService.UpdateProduct(body,params.id,user)
}

@Get()
async GetAllProducts(@Query() query:QueryProductDto ){
  return await this._productService.GetAllProducts(query)
}

@Auth()
@Delete("/softDelete/:id")
async softDeleteProductById(@Param() params:IdDto ,@User() user:IHUser){
      return await this._productService.softDeleteProductById(params.id,user)
}
@Auth()
@Delete("/:id")
async DeleteProductById(@Param() params:IdDto ,@User() user:IHUser){
      return await this._productService.DeleteProductById(params.id,user)
}

}
