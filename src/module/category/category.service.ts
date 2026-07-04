import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { IHUser } from 'src/models/user.model';
import { BrandRepo } from 'src/Repo/brand.repo';
import { S3BucketService } from 'src/common/services/s3Bucket/s3.service';
import { Types } from 'mongoose';
import { CatogeryRepo } from 'src/Repo/category.repo';
import { CreatCategoryDto, QueryCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(private _brandRepo: BrandRepo, private _s3BucketService: S3BucketService, private _categoryRepo: CatogeryRepo) { }

  async createCategory(body: CreatCategoryDto, file: Express.Multer.File, user: IHUser) {
    const { name, brands } = body;


    const category = await this._categoryRepo.findOne({ filter: { name } })

    if (category) throw new ConflictException("this catogery already exist")

    const strictIds = ([... new Set(brands || [])] as any).map(id => Types.ObjectId.createFromHexString(id))
    if (brands && (await this._brandRepo.find({ filter: { _id: { $in: brands } } })).length != strictIds.length) {

      throw new NotFoundException("som of id not found")
    }

    const image = await this._s3BucketService.uploadFile({ file, path: `Category/${user._id}/` })

    const createCategory = await this._categoryRepo.create({
      data: {
        name,
        brands: strictIds,
        image,
        createdBy: user._id
      }
    })

    return createCategory
  }
  // ============================== Update =================================
  async UpdateCategory(body: UpdateCategoryDto, id: Types.ObjectId, user: IHUser) {

    const { name, brands } = body


    const category = await this._categoryRepo.findOne({ filter: { _id: id, createdBy: user._id } })

    if (!category) throw new ConflictException("this catogery not exist")

    if (name && name == category.name) {
      throw new ConflictException("this name already exsit in ccategories name")
    }

    const strictIds = ([... new Set(brands || [])] as any).map(id => Types.ObjectId.createFromHexString(id))
    if (brands && (await this._brandRepo.find({ filter: { _id: { $in: brands } } })).length != strictIds.length) {

      throw new NotFoundException("som of id not found")
    }



    const updatedCategories = await this._categoryRepo.findOneAndUpdate({
      filter: { _id: category._id }, update: {
        name,
        ...(brands !== undefined ? { brands: strictIds } : {}),
        updatedBy: user._id
      },
      options: { returnDocument: "after" }
    })

    return updatedCategories

  }

  async GetAllCategories(query: QueryCategoryDto) {
    const { page, limit, search } = query

    const categories = await this._categoryRepo.paginate({
      filter: search ?
        { name: { $regex: search, $options: "i" } } : {}, page, size: limit, options: {
          populate: [{ path: "brands" }],
        }
    })

    return categories

  }

  async DeleteCategoryById(id: Types.ObjectId, user: IHUser) {

    const category = await this._categoryRepo.findOne({ filter: { _id: id, createdBy: user._id } })

    if (!category) {
      throw new NotFoundException("not found this category")
    }
    await this._s3BucketService.DeleteFile(category.image)

    const deleteCategory = await this._categoryRepo.deleteOne({ filter: { _id: id } })

    return deleteCategory

  }
  async softDeleteCatogeryById(id: Types.ObjectId, user: IHUser) {

    const category = await this._categoryRepo.findOne({ filter: { _id: id, createdBy: user._id } })

    if (!category) {
      throw new NotFoundException("not found this category")
    }
    // await this._s3BucketService.DeleteFile(brand.logo)

    const softdeleteCategory = await this._categoryRepo.findOneAndUpdate({ filter: { _id: id }, update: { deletedAt: Date.now(), deletedBy: user._id }, options: { returnDocument: "after" } })

    return softdeleteCategory

  }
   
     
}
