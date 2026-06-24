import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './module/auth/auth.module';
import { OrderModule } from './module/order/order.module';
import { UserController } from './module/user/user.controller';
import { UserModule } from './module/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DB_URI } from './config/config.service';
import { Connection } from 'mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './module/user/user.service';

@Module({  // @//////   decrator
  imports: [AuthModule, OrderModule, UserModule,
    ConfigModule.forRoot({
   envFilePath: ['.env.dev','.env.prod'],isGlobal:true}),
   JwtModule.register({global:true}),
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('DB_URI'), 
  onConnectionCreate: (connection: Connection) => {
    connection.on('connected', () => console.log('connected'));
    connection.on('open', () => console.log('open'));
    connection.on('disconnected', () => console.log('disconnected'));
    connection.on('reconnected', () => console.log('reconnected'));
    connection.on('disconnecting', () => console.log('disconnecting'));

    return connection;
  },
  }),
  inject: [ConfigService],
})
],
  exports:[],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


