import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{cors:true});
  // const port = 3000
  await app.listen(PORT ,()=>{
    console.log("server is running on 3000");
    
  });
}
bootstrap();
