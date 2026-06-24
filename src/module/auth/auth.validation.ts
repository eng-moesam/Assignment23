import { GenderEnum } from "src/common/enums/enums.user"
import z from "zod"
export const commonValidationFileds = {
    id:z.string()
    // .refine((value)=>{
    //       return Types.ObjectId.isValid(value)
    //     },"invalidObject id ")
        ,
    email: z.email(),
    password: z.string().regex(new RegExp(/(?=.*[a-z/)(?=.*[A-Z])(?=.*\d)(?=.*\W).{6,16}/),{error:"password must be 6-16 and use A a #$%^"}),
    confrimPassword: z.string(),
    userName: z.string().min(3).max(20),
    gender: z.enum(GenderEnum),
    age: z.number().positive(),
    phone: z.string().regex(new RegExp(/^(\+201|00201|01)(0|1|2|5)\d{8}$/)),
    otp: z.string().regex(new RegExp(/\d{6}/))
}

  export const loginSchema={
    body:z.strictObject({
        email:commonValidationFileds.email,
        password:commonValidationFileds.password,
        FCM:z.string().optional()
    
  })
   }

export const signUpSchema={
    body:loginSchema.body.extend({
        confrimPassword:commonValidationFileds.confrimPassword,
        userName:commonValidationFileds.userName,
        gender:commonValidationFileds.gender,
        age:commonValidationFileds.age.optional(),
        phone:commonValidationFileds.phone.optional()
    }).refine((data)=>{
      return   data.confrimPassword===data.password
    },{
    error:"confrim password not match password"}
)
   }

