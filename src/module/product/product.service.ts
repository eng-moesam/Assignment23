import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { IHUser } from 'src/models/user.model';
import { BrandRepo } from 'src/Repo/brand.repo';
import { S3BucketService } from 'src/common/services/s3Bucket/s3.service';
import { Types } from 'mongoose';
import { CatogeryRepo } from 'src/Repo/category.repo';
import { ProductRepo } from 'src/Repo/product.repo';
import { CreatProductDto, QueryProductDto, UpdateProductDto } from './dto/product.dto';
import { StorageApproachEnum } from 'src/common/enums/multer.enums';
import { SubCatogeryRepo } from 'src/Repo/subCategory.repo';

@Injectable()
export class ProductService {
  constructor(private _brandRepo: BrandRepo, private _s3BucketService: S3BucketService,
    private _categoryRepo: CatogeryRepo,
    private _productRepo: ProductRepo,
    private _subCategoryRepo: SubCatogeryRepo
  ) { }

  async createProduct(
    body: CreatProductDto,
    files: { image: Express.Multer.File[], subImages: Express.Multer.File[] },
    user: IHUser) {
    let { name, brands, categoryId, subCategoryId, description, discount, price, stock } = body;

    const existProduct = await this._productRepo.findOne({ filter: { name } })
    if (existProduct) throw new ConflictException("product already exist")

    const category = await this._categoryRepo.findOne({ filter: { _id: categoryId } })

    if (!category) throw new ConflictException("catogery not exist")
    const subCategory = await this._subCategoryRepo.findOne({ filter: { _id: subCategoryId } })

    if (!subCategory) throw new ConflictException("subCatogery not exist")
    const brand = await this._brandRepo.findOne({ filter: { _id: brands } })

    if (!brand) throw new ConflictException("brand not exist")


    let mainPrice;

    if (discount) {
      mainPrice = price
    }

    price = price - (price * ((discount || 0) / 100))


    const image = await this._s3BucketService.uploadFile({
      file: files.image[0],
      path: `MainImage/Product/${user._id}`,
    })

    let subImages
    if (files.subImages.length > 0) {
      subImages = await this._s3BucketService.uploadFiles({
        files: files.subImages,
        path: `SubImages/Product/${user._id}`,
        uploadApproach: StorageApproachEnum.Memory
      })
    }


    const product = await this._productRepo.create({
      data: {
        name, brands, categoryId, subCategoryId, price, discount, image, subImages,
        stock, description, createdBy: user._id, mainPrice
      }
    })

    return product;


  }

  async UpdateProduct(body: UpdateProductDto, id: Types.ObjectId, user: IHUser) {
    const { name, brands, categoryId, subCategoryId, description, discount, price, stock } = body

    const product = await this._productRepo.findOne({ filter: { _id: id, createdBy: user._id } })

    if (!product) throw new ConflictException("this product not exist")

    if (name && name == product.name) {
      throw new ConflictException("this name already exsit in products name")
    }

    if (categoryId) {
      const category = await this._categoryRepo.findOne({ filter: { _id: categoryId } })
      if (!category) throw new NotFoundException("catogery not exist")
    }

    if (subCategoryId) {
      const subCategory = await this._subCategoryRepo.findOne({ filter: { _id: subCategoryId } })
      if (!subCategory) throw new NotFoundException("subCatogery not exist")
    }

    if (brands) {
      const brand = await this._brandRepo.findOne({ filter: { _id: brands } })
      if (!brand) throw new NotFoundException("brand not exist")
    }

    const updateData: Record<string, unknown> = {
      updatedBy: user._id
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (brands !== undefined) updateData.brands = brands
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (subCategoryId !== undefined) updateData.subCategoryId = subCategoryId
    if (stock !== undefined) updateData.stock = stock

    if (price !== undefined || discount !== undefined) {
      const basePrice = price ?? product.mainPrice ?? product.price
      const newDiscount = discount ?? product.discount ?? 0

      if (newDiscount) {
        updateData.mainPrice = basePrice
      }
      updateData.discount = newDiscount
      updateData.price = basePrice - (basePrice * (newDiscount / 100))
    }

    const updatedProduct = await this._productRepo.findOneAndUpdate({
      filter: { _id: product._id }, update: updateData,
      options: { returnDocument: "after" }
    })

    return updatedProduct
  }

  async GetAllProducts(query: QueryProductDto) {
    const { page, limit, search } = query

    const products = await this._productRepo.paginate({
      filter: search ?
        { name: { $regex: search, $options: "i" } } : {}, page, size: limit, options: {
          populate: [{ path: "brands" }, { path: "categoryId" }, { path: "subCategoryId" }],
        }
    })

    return products

  }

  async DeleteProductById(id: Types.ObjectId, user: IHUser) {

    const product = await this._productRepo.findOne({ filter: { _id: id, createdBy: user._id } })

    if (!product) {
      throw new NotFoundException("not found this product")
    }
    await this._s3BucketService.DeleteFile(product.image)
    if (product.subImages?.length) {
      await this._s3BucketService.DeleteFiles(product.subImages.map(Key => ({ Key })))
    }

    const deleteProduct = await this._productRepo.deleteOne({ filter: { _id: id } })

    return deleteProduct

  }
  async softDeleteProductById(id: Types.ObjectId, user: IHUser) {

    const product = await this._productRepo.findOne({ filter: { _id: id, createdBy: user._id } })

    if (!product) {
      throw new NotFoundException("not found this product")
    }

    const softdeleteProduct = await this._productRepo.findOneAndUpdate({ filter: { _id: id }, update: { deletedAt: Date.now(), deletedBy: user._id }, options: { returnDocument: "after" } })

    return softdeleteProduct

  }
}
