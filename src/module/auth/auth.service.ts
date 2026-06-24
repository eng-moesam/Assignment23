import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IHUser, User } from "src/models/user.model";
import { RedisService } from "../../common/services/redis/redis.service";
import { EmailSendService } from "../../common/services/email/send.email";
import { UserRepo } from "../../Repo/user.repo";
import { TokenService } from "../../common/services/security/token.service";
import { SecurityService } from "src/common/services/security/security.service";
import { MailService } from "src/common/services/email/email.service";
import { EmailEnum } from "src/common/enums/email.enums";
import { ProviderEnum } from "src/common/enums/enums.user";
import { ConfigService } from "@nestjs/config";
import { ConfrimEmailDto, LoginDto, SignUpDto } from "./dto/signup.dto";
import { OAuth2Client } from "google-auth-library";

 



 @Injectable()
 export class AuthService{

  constructor(@InjectModel(User.name) private __userModel :Model<User>,
  private _redisMethods:RedisService,
  private _SendEmail:EmailSendService,
  private _userRepo:UserRepo,
  private _tokenService:TokenService,
  private _securityService:SecurityService,
  private _mailService:MailService,
  private _configService:ConfigService
){}
  
    public async signUp(bodyData: SignUpDto): Promise<IHUser> {
        const { email } = bodyData
        const isEmail = await this._userRepo.findOne({ filter: { email } })
        if (isEmail) {
            throw new ConflictException("email is already exist")
        }
        // bodyData.password = await hashOperation({ plaintext: bodyData.password })
        // if (bodyData.phone) {
        //     const phoneEncrypted = encryptValue({ value: bodyData.phone })
        //     bodyData.phone = phoneEncrypted
        // }

        const [user] = await this._userRepo.create({ data: [bodyData] })

        await this._mailService.sendEmailOtp({ email, emailType: EmailEnum.confrimEmail, subject: EmailEnum.confrimEmail })

        return user!;

    }

    async confrimEmail(bodyData: ConfrimEmailDto) {
        const { email, otp } = bodyData
        const user = await this._userRepo.findOne({ filter: { email, confrimEmail: false } })

        if (!user) {
            throw new BadRequestException("email already exist")
        }
        const storedOtp = await this._redisMethods.get(this._redisMethods.getOtpKey({ email, emailType: EmailEnum.confrimEmail }))
        if (!storedOtp) {
            throw new BadRequestException("expired Otp")
        }
        const isOtpValid = await this._securityService.compareOperation({ plaintext: otp, hashedvalue: storedOtp })
        if (!isOtpValid) {
            throw new BadRequestException("otp not valid")
        }
        user.confrimEmail = true,
            await user.save();
    }
    async resendOtpConfrimEmail(email: string) {
        await this._mailService.sendEmailOtp({ email, emailType: EmailEnum.confrimEmail, subject: EmailEnum.confrimEmail })
    }


    async resendForgetPasswordOtp(email: string) {
        await this._mailService.sendEmailOtp({ email, emailType: EmailEnum.forgetPassword, subject: EmailEnum.forgetPassword })
    }
    async sendOTPforgetPassword(email: string) {
        const user = await this._userRepo.findOne({ filter: { email } })
        if (!user) {
            return;
        }
        if (!user.confrimEmail) {
            throw new BadRequestException("confrim your email frist");

        }
        await this._mailService.sendEmailOtp(
            { email, emailType: EmailEnum.forgetPassword, subject: EmailEnum.forgetPassword })
    }

    async verfiyOTPforgetPassword(bodyData: any) {

        const { email, otp } = bodyData

        const emailOtp = await this._redisMethods.get(
            this._redisMethods.getOtpKey({
                email,
                emailType: EmailEnum.forgetPassword
            })
        )
        if (!emailOtp) {

            throw new BadRequestException("otp Expired");


        }
        const storedOtp = await this._redisMethods.get(this._redisMethods.getOtpKey({ email, emailType: EmailEnum.forgetPassword }))
        if (!storedOtp) {
            throw new BadRequestException("expired Otp")
        }
        const isOtpValid = await this._securityService.compareOperation({
            plaintext: otp,
            hashedvalue: storedOtp
        })
        if (!isOtpValid) {
            throw new BadRequestException("otp not valid")
        }


    }
    async resetPassword(bodyData: any) {
        const { email, password, otp } = bodyData
        await this.verfiyOTPforgetPassword({ email, otp })

        await this._userRepo.updateOne({
            filter: { email },
            data: { password: await this._securityService.hashOperation({ plaintext: password }) }
        })

    }


    public async login(bodyData: LoginDto) {

        const { email, password } = bodyData
        const user = await this._userRepo.findOne({ filter: { email } })

        if (!user) {
            throw new NotFoundException("no found user")

        }
        const ispassword = await this._securityService.compareOperation({ plaintext: password, hashedvalue: user.password })

        if (!ispassword) {
            throw new NotFoundException("invalid info")
        }
        if (user.phone) {
            user.phone = this._securityService.decryptValue({ value: user.phone })
        }
        // if(bodyData.FCM){
        //     await this._redisMethods.addFCMTokensToSet({userId:user._id,FCMToken:bodyData.FCM})
        //     const tokens = await this._redisMethods.getFCMTokensSetMembers(user._id)
        //     // await this._NotificationService.sendNotifications({tokens,data:{title:"user logged In",body:`user logged In ${Date.now()}`}})
        // }
         
        const { acsses_token, refresh_token } = this._tokenService.genratesignToken(user);
        return { acsses_token, refresh_token }


    }


    async verfiyGoogleTokenId(tokenId:string) {
        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: this._configService.get("WEB_CLIENT_ID") ,  // Specify the WEB_CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        // This ID is unique to each Google Account, making it suitable for use as a primary key
        // during account lookup. Email is not a good choice because it can be changed by the user.
        // const userid = payload['sub'];
        // If the request specified a Google Workspace domain:
        // const domain = payload['hd'];
        return payload
    }

    async loginWithGmail(idToken:string):Promise<{
     acsses_token:string;
      refresh_token:string}> {

        const payloadToken = await this.verfiyGoogleTokenId(idToken)
        if(!payloadToken){
         throw new BadRequestException("invalid tokemn payload")   
        }
        if (!payloadToken.email_verified) {
            throw new BadRequestException("email not varfied")
        }

        const user = await this._userRepo.findOne({  filter: { email: payloadToken.email as string, provider: ProviderEnum.Google } })

        if (!user) {

            return this.signupWithGmail( idToken )


        }

        const { acsses_token, refresh_token } =this._tokenService.genratesignToken(user)

        return{ acsses_token, refresh_token }

    }

    async signupWithGmail(idToken:string):Promise<{
     acsses_token:string;
      refresh_token:string}> {


        const payloadGoogleToken = await this.verfiyGoogleTokenId(idToken)
        if(!payloadGoogleToken){
         throw new BadRequestException("invalid tokemn payload")   
        }


        if (!payloadGoogleToken.email_verified) {
            throw new BadRequestException("email not varfied")
        }

        const user = await this._userRepo.findOne({  filter: { email: payloadGoogleToken.email as string} })

        if (user) {
            if (user.provider == ProviderEnum.System) {
                throw new BadRequestException(" acount already exsit sign up with password and email")
            }
            return  await this.loginWithGmail(idToken) //login with google
        }

        const [newUser] = await this._userRepo.create({
           data: [{
                email: payloadGoogleToken.email,
                userName: payloadGoogleToken.name,
                profilePic: payloadGoogleToken.picture,
                confrimEmail: true,
                provider: ProviderEnum.Google
            }]
        })
        const { acsses_token, refresh_token } = this._tokenService.genratesignToken(newUser!)



        return {  acsses_token, refresh_token  }



    }

 } 