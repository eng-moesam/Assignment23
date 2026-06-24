import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import UserModel from "src/models/user.model";
import { UserRepo } from "src/Repo/user.repo";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createClient } from "redis";
import { RedisService } from "../../common/services/redis/redis.service";
import { EmailSendService } from "src/common/services/email/send.email";
import { TokenService } from "../../common/services/security/token.service";
import { JwtService } from "@nestjs/jwt";
import { SecurityService } from "src/common/services/security/security.service";
import { MailService } from "src/common/services/email/email.service";
import { SecurityModule } from "src/common/services/security/security.module";

@Module({
    imports:[UserModel],
    controllers:[AuthController],
    providers:[AuthService,UserRepo,
        {provide:"Redis_Client",
            inject:[ConfigService],
            useFactory:async (configService:ConfigService)=>{
               const clinet = createClient({url:configService.get("REDIS_URL")})
                clinet.on("error",(err)=>{
                    console.log("redisError",err);
                    
                })

                await clinet.connect()
                console.log("redis connect");
                
               return clinet
            },
            
        },
        RedisService,
        EmailSendService,
        TokenService,
        JwtService,
        SecurityService,
        MailService
    ],
    exports:[AuthService,TokenService]
})
export class AuthModule{}