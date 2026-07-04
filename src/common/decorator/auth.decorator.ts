import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { tokenTypeEnum } from "../enums/token.enums";
import { RoleEnum } from "../enums/enums.user";
import { AuthurizationGuard } from "../guard/authurization.guard";
import { AuthGuard } from "../guard/authentication.guard";



export function Auth({tokenType=tokenTypeEnum.access,role=[RoleEnum.User]}:{tokenType?:tokenTypeEnum,role?:RoleEnum[]}={}){
    return applyDecorators( SetMetadata("tokenType",tokenType),
        SetMetadata("Roles",role),
        UseGuards(AuthGuard,AuthurizationGuard))
}