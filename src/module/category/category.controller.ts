import { Body, Controller, Delete, Get, Param, ParseFilePipe, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/utils/multer.config';
import { Auth } from 'src/common/decorator/auth.decorator';
import { RoleEnum } from 'src/common/enums/enums.user';
import { User } from 'src/common/decorator/user.decorator';
import type { IHUser } from 'src/models/user.model';
import { CreatCategoryDto, IdDto, QueryCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
    constructor(private readonly _categoryService: CategoryService) { }
    @Post()
    @Auth({ role: [RoleEnum.User] })
    @UseInterceptors(FileInterceptor("image", multerOptions()))
    async createCategory(@Body() body: CreatCategoryDto, @UploadedFile(ParseFilePipe) file: Express.Multer.File, @User() user: IHUser) {
        return await this._categoryService.createCategory(body, file, user)
    }
    @Patch("/:id")
    @Auth()
    async UpdateCategory(@Param() params: IdDto, @Body() body: UpdateCategoryDto, @User() user: IHUser) {
        return await this._categoryService.UpdateCategory(body, params.id, user)
    }

    @Get()
    async GetAllCategories(@Query() query: QueryCategoryDto) {
        return await this._categoryService.GetAllCategories(query)
    }

    @Auth()
    @Delete("/softDelete/:id")
    async softDeleteCategoryById(@Param() params: IdDto, @User() user: IHUser) {
        return await this._categoryService.softDeleteCatogeryById(params.id, user)
    }
    @Auth()
    @Delete("/:id")
    async DeleteCategoryById(@Param() params: IdDto, @User() user: IHUser) {
        return await this._categoryService.DeleteCategoryById(params.id, user)
    }


}
