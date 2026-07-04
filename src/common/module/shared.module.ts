import { Global, Module } from "@nestjs/common";
import UserModel from "src/models/user.model";
import { UserRepo } from "src/Repo/user.repo";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createClient } from "redis";
import { RedisService } from "../../common/services/redis/redis.service";
import { TokenService } from "../../common/services/security/token.service";
import { JwtService } from "@nestjs/jwt";
import { SecurityService } from "../services/security/security.service";
import { MailService } from "../services/email/email.service";
import { SecurityModule } from "../services/security/security.module";

@Global()
@Module({
    imports:[SecurityModule,UserModel],
    providers:[UserRepo,
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
        TokenService,
        JwtService,
        SecurityService,
        MailService,
    ],
    exports:[RedisService,TokenService,UserRepo,JwtService]
})
export class SharedModule{}