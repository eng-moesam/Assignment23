import { Transform } from "class-transformer";
import { Allow, IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, Matches, MaxLength, MinLength, Validate, ValidateIf } from "class-validator";
import { GenderEnum } from "src/common/enums/enums.user";
import { IsMatch, MatchTwoFields } from "src/common/validation/matchPassword.validation";


export class LoginDto {
     @IsEmail()
    email!:string;

    @IsStrongPassword()
    password!:string;
    

    @IsOptional()
    @IsString()
    FCM!:string;

}

export class SignUpDto extends LoginDto{
    @MaxLength(20)
    @MinLength(3)
    @IsString()
    userName!:string;
//    @Transform((obj)=>{
//     console.log(obj);
    
//     const {value} = obj
//     console.log(value);
    
//     if(value == "true" || value ==1) return true
//     if(value == "false" || value ==0) return false

//    }) 
//    @IsBoolean()
//     flag!:boolean
   
    @ValidateIf( obj=>obj.password)
    @IsMatch(["password"])
    confrimPassword!:string;

    @IsOptional()
    @IsEnum(GenderEnum,{message:"gender must be male or female"})
    gender!:string;
    @IsOptional()
    @IsPhoneNumber()
    phone!:string;
}


export class  ResendConfrimEmailDto {

    @IsEmail()
    email!:string
   

}
export class ConfrimEmailDto extends ResendConfrimEmailDto {
    
    @Matches(/\d{6}/)
    otp!:string;
   

}


export class signUpWithGmailDto{
    @IsString()
    idToken!: string;
}
