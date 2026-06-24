
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { TokenService } from '../services/security/token.service';
import { IRequestAuth } from '../interface/request.interface';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private _tokenService:TokenService,private _reflactor:Reflector){}
 async canActivate(
    context: ExecutionContext,
  ): Promise<boolean>  {
 
    
  let authorization:string |undefined
 let req!:IRequestAuth;

const  contextType = context.getType()
  switch (contextType) {
    case "http":
        req = context.switchToHttp().getRequest()
        authorization = req.headers.authorization
        break;
  
    default:
        break;
  }
      if(!authorization){
        throw new UnauthorizedException("you need to login frist")

      }
     const[BearerKey,tokenKey]=  authorization.split(" ")
   
       if(BearerKey != "Bearer"){

        throw new BadRequestException("invalid Bearer Key ")

       }
         if(!tokenKey){
        throw new UnauthorizedException("you need to login frist")

      }
      const tokenType = this._reflactor.getAllAndOverride("tokenType",[context.getHandler(),context.getClass()])
      const{user,verfiy}= await this._tokenService.checkTokenCode(tokenKey,
        tokenType
    )
    req.user=user
    
    req.payload=verfiy
      
     return true;
  }
}
