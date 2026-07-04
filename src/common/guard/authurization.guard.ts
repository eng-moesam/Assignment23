
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { TokenService } from '../services/security/token.service';
import { IRequestAuth } from '../interface/request.interface';
import { Reflector } from '@nestjs/core';
import { IHUser } from 'src/models/user.model';
import { RoleEnum } from '../enums/enums.user';

@Injectable()
export class AuthurizationGuard implements CanActivate {
    constructor(private _tokenService:TokenService,private _reflactor:Reflector){}
 async canActivate(
    context: ExecutionContext,
  ): Promise<boolean>  {
 
    
 let req!:IRequestAuth;
let user!:IHUser
const  contextType = context.getType()
  switch (contextType) {
    case "http":
        req = context.switchToHttp().getRequest()
       user= req.user
        break;
  
    default:
        break;
  }
  
   
const roles:RoleEnum[]=this._reflactor.getAllAndOverride("Roles",[context.getHandler(),context.getClass()])
  
      
     return roles.includes(user.role);
  }
}
