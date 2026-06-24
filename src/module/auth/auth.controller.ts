import {  Body, Controller, HttpCode, HttpStatus, Post, Res, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ConfrimEmailDto, LoginDto, ResendConfrimEmailDto, SignUpDto, signUpWithGmailDto } from "./dto/signup.dto";
import { UserRepo } from "src/Repo/user.repo";
import type{ Response } from "express";



@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller("auth")
export class AuthController {

  constructor(private _AuthService: AuthService, private _userRepo :UserRepo) { }

  @HttpCode(HttpStatus.CREATED)
  @Post("signUp")
 async signUp(@Body() body: SignUpDto) {
    console.log({ body });

    return await this._AuthService.signUp(body)

  }
  
  // @HttpCode(HttpStatus.OK)
  @Post("logeIn")
 async logeIn(@Body() body: LoginDto) {
    console.log({ body });

    return await this._AuthService.login(body)

  }
  // @HttpCode(HttpStatus.OK)
  @Post("confrim-email")
 async confrimEmail(@Body() body: ConfrimEmailDto) {
    console.log({ body });

    return await this._AuthService.confrimEmail(body)

  }
  // @HttpCode(HttpStatus.OK)
  @Post("resend-confrim-email-otp")
 async resendConfrimEmail(@Body() body:ResendConfrimEmailDto) {
    // console.log({ body });

     await this._AuthService.resendOtpConfrimEmail(body.email)

     return {msg:"check your inbox"}

  }
  @Post("signup/gmail")
 async signUpWithGmail(@Body() body:signUpWithGmailDto,
  @Res({passthrough:true}) res:Response) {
    // console.log({ body });

   const result=  await this._AuthService.signupWithGmail(body.idToken)
      // res.status(result.status)
     return {msg: "done  ",result}

  }

}
