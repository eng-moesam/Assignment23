import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UserRepo } from "src/Repo/user.repo";
import { RedisService } from "../redis/redis.service";
import { ConfigService } from "@nestjs/config";
import { RoleEnum } from "src/common/enums/enums.user";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { IHUser } from "src/models/user.model";
import { randomUUID } from "node:crypto";
import { tokenTypeEnum } from "src/common/enums/token.enums";
import { JwtPayload } from "jsonwebtoken";


@Injectable()
export class TokenService {

  private TOKEN_SIGNATURE_USER: string;
  private TOKEN_SIGNATURE_ADMIN: string;
  private TOKEN_SIGNATURE_USER_Refresh: string;
  private TOKEN_SIGNATURE_ADMIN_Refresh: string

  constructor(private _userRepo: UserRepo,
    private _redisMethods: RedisService,
    private _jwtService: JwtService,
    private _configService: ConfigService) {
    this.TOKEN_SIGNATURE_USER = _configService.get<string>("TOKEN_SIGNATURE_USER") as string
    this.TOKEN_SIGNATURE_ADMIN = _configService.get<string>("TOKEN_SIGNATURE_ADMIN") as string
    this.TOKEN_SIGNATURE_USER_Refresh = _configService.get<string>("TOKEN_SIGNATURE_USER_Refresh") as string
    this.TOKEN_SIGNATURE_ADMIN_Refresh = _configService.get<string>("TOKEN_SIGNATURE_ADMIN_Refresh") as string
  }


  getSignature(role: RoleEnum = RoleEnum.User) {

    let refreshSignature = ""
    let accessSignature = ""
    switch (role) {
      case RoleEnum.User:
        refreshSignature = this.TOKEN_SIGNATURE_USER_Refresh
        accessSignature = this.TOKEN_SIGNATURE_USER
        break;
      case RoleEnum.Admin:
        refreshSignature = this.TOKEN_SIGNATURE_ADMIN_Refresh
        accessSignature = this.TOKEN_SIGNATURE_ADMIN
        break;
      default:
        throw new Error("Invalid role for token signature");

    }
    return { accessSignature, refreshSignature }
  }

  generateToken({ payload = {}, signature, options = {} }: {
    payload: object,
    signature: string,
    options?: JwtSignOptions
  }) {
    return this._jwtService.sign(payload, { secret: signature, ...options });
  }

  verfiyToken({ token, signature }: { token: string, signature: string }) {
    return this._jwtService.verify(token, { secret: signature })
  }
  decodedToken(token: string) {
    return this._jwtService.decode(token)
  }


  genratesignToken(user: IHUser) {

    const { accessSignature, refreshSignature } = this.getSignature(user.role)
    const jid = randomUUID()
    const acsses_token = this.generateToken({
      payload: {
        sub: user._id,
      }
      , signature: accessSignature,
      options: {
        audience: [String(user.role), tokenTypeEnum.access],
        expiresIn: 60 * 60,
        jwtid: jid
      }
    })

    const refresh_token = this.generateToken({
      payload: { sub: user._id }, signature: refreshSignature,
      options: {
        audience: [String(user.role), tokenTypeEnum.refresh],
        expiresIn: "1y",
        jwtid: jid

      }
    })


    return { acsses_token, refresh_token }
  }


  async checkTokenCode(tokenKey: string, tokenTypeParam = tokenTypeEnum.access) {

    const decoded = this.decodedToken(tokenKey) as JwtPayload
    if (!decoded || !decoded.aud) {
      throw new UnauthorizedException("invalid token")
    }

    const [userRole, TokenType] = decoded.aud

    if (TokenType != tokenTypeParam) {
      throw new UnauthorizedException("invalid token type");
    }

    const { accessSignature, refreshSignature } = this.getSignature(Number(userRole) as RoleEnum)



    const verfiy = this.verfiyToken({
      token: tokenKey,
      signature: tokenTypeParam == tokenTypeEnum.access ? accessSignature : refreshSignature
      //   signature:
      //   tokenTypeEnum.refresh== TokenType ? refreshSignature:accessSignature 
    }) as JwtPayload

    if (verfiy.jti &&
      (await this._redisMethods.get(this._redisMethods.getBlackListToken({ userId: verfiy.sub!, tokenId: verfiy.jti }))
      )) {
      throw new ConflictException("you need to sign again")
    }

    const user = await this._userRepo.findById({ id: verfiy.sub as string })
    if (!user) {
      throw new NotFoundException("invalid acount")
    }
    if (new Date(verfiy.iat! * 1000) < user.changeCreditTime) {
      throw new UnauthorizedException("you need to login again")

    }
    // console.log(verfiy.jti);
    return {
      user, verfiy
    }

  }

}

