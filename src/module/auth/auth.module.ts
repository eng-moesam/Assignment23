import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import UserModel from "src/models/user.model";
import { UserRepo } from "src/Repo/user.repo";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createClient } from "redis";
import { RedisService } from "../../common/services/redis/redis.service";
import { TokenService } from "../../common/services/security/token.service";
import { JwtService } from "@nestjs/jwt";
import { SecurityService } from "src/common/services/security/security.service";
import { MailService } from "src/common/services/email/email.service";
import { SecurityModule } from "src/common/services/security/security.module";
import { SharedModule } from "../../common/module/shared.module";

@Module({
    imports:[],
    controllers:[AuthController],
    providers:[AuthService,SecurityService,MailService],
})
export class AuthModule{}