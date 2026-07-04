
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadGatewayException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap, timeout } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // console.log('Before...');

    // const now = Date.now();


    return next
      .handle()
      .pipe(
      map((data)=>{
        return {msg:'done',data}
      })    
    );
  }
}
