
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IHUser } from 'src/models/user.model';
import { IRequestAuth } from '../interface/request.interface';

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
   
 let req!:IRequestAuth;
let user!:IHUser
const  contextType = context.getType()
  switch (contextType) {
    case "http":
        req = context.switchToHttp().getRequest()
        break;
  
    default:
        break;
  }
 
    return req.user;
  },
);
