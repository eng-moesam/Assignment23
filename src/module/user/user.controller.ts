import { Controller, Get, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { tokenTypeEnum } from 'src/common/enums/token.enums';
import { AuthGuard } from 'src/common/guard/authentication.guard';
import type { IRequestAuth } from 'src/common/interface/request.interface';

@Controller('user')
export class UserController {
    @SetMetadata("tokenType",tokenTypeEnum.access)
    @UseGuards(AuthGuard)
    @Get()
    getProfile(@Req() req:IRequestAuth){
           return {user:req.user}
    }
} 
