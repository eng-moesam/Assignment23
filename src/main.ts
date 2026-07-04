import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './config/config.service';
import { ResponseInterceptor } from './common/interceptor/Response.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{cors:true});
  // const port = 3000
  app.useGlobalPipes(new ValidationPipe({
    whitelist:true,
    forbidNonWhitelisted:true
  }))
  app.useGlobalInterceptors(new ResponseInterceptor())
  await app.listen(PORT ,()=>{
    console.log("server is running on 3000");
    
  });
}
bootstrap();
