import {  Types, model, type HydratedDocument } from 'mongoose';
import  { GenderEnum, ProviderEnum, RoleEnum } from "../common/enums/enums.user"
// import { hashOperation } from '../Common/Security/hash.js';
// import { encryptValue } from '../Common/Security/encryption.js';
// import mailService from "../../Common/Email/email.service.js"
// import { EmailEnum } from '../Common/enums/email.enums.js';
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
 import {AuthService} from "../module/auth/auth.service"
import { AuthModule } from 'src/module/auth/auth.module';
import { SecurityService } from '../common/services/security/security.service';
import { SecurityModule } from '../common/services/security/security.module';

// 1. Create an interface representing a document in MongoDB.
export interface IUser { 
    userName: string;
    email: string;
    password: string;
    confrimEmail: boolean;
    phone: string;
    gender: GenderEnum;
    role: RoleEnum;
    age: number;
    frindes?:Types.ObjectId[];
    provider: ProviderEnum;
    profilePic: string;
    covPic: string[];
    changeCreditTime: Date;
    deletedAt: Date;

}

export type IHUser = HydratedDocument<IUser>;

// 2. Create a Schema corresponding to the document interface.


@Schema({
    timestamps:true,
    strictQuery:true
})
export class User{
    @Prop({ type: String, required: true })
  userName!: string;
  @Prop({ type: String, required: true })
    email!: string;
    @Prop({
        type: String,
        required: function (this:any): boolean {
            return this.provider == ProviderEnum.System
        }
    })
    password!: string;
    @Prop({ type: Boolean, default: false })
    confrimEmail!: boolean;
    @Prop({ type: String})
    phone!: string;
    @Prop({ type: Number, enum: GenderEnum, default: GenderEnum.Male })
    gender!: GenderEnum;
    @Prop({ type: Number, enum: RoleEnum, default: RoleEnum.User })
    role!:RoleEnum ;
    @Prop({type:Number})
    age!: number;
    @Prop({ type: Number, enum: ProviderEnum, default: ProviderEnum.System })
    provider!: ProviderEnum;
    @Prop( String)
    profilePic!: string;
    @Prop([String])
    covPic!: [string];
    @Prop({type:Types.ObjectId,ref:"User"})
    frindes!: [Types.ObjectId];
    @Prop({ type: Date})
    changeCreditTime!: Date;
    @Prop({ type: Date})
    deletedAt!:Date;
}
const userSchema = SchemaFactory.createForClass(User)

// userSchema.post("save",async function(this:IHUser &{wasNew:Boolean}){
    
//     // try{
//     //     if(this.wasNew){
//     //     // await mailService.sendEmailOtp({email: this.email, emailType: EmailEnum.confrimEmail, subject: EmailEnum.confrimEmail })}
//     // } catch (error) {
//     //     console.log(error);
        
//     // }
    
    
// })
// userSchema.pre("validate",function (){
//     console.log("pre validate");
    
// })
// userSchema.post("validate",function (){
//     console.log("post validate");

// })
// userSchema.pre("updateOne",{document:true,query:false},function (){
//     console.log("pre updateOne");
//     console.log(this);
    
// })
// userSchema.post("deleteOne",function (){
//     console.log("post validate");

// })

// userSchema.post("deleteOne",function (){
//     console.log("post validate");

// })
// 3. Create a Model.
const UserModel =MongooseModule.forFeatureAsync([{name:User.name,
    useFactory(securityService: SecurityService){
 userSchema.pre("save",async function(this:IHUser &{wasNew:Boolean}){

    this.wasNew=this.isNew
    
    if(this.isModified("password")) {
    this.password = await securityService.hashOperation({ plaintext: this.password })
          }
          
          if (this.phone&&this.isModified("phone")) {
                const phoneEncrypted = securityService.encryptValue({ value: this.phone })
                this.phone = phoneEncrypted
            }    
})
        userSchema.post("save",async function(this:IHUser &{wasNew:Boolean}){
    
    // try{
    //     if(this.wasNew){
    //     await mailService.sendEmailOtp({email: this.email, emailType: EmailEnum.confrimEmail, subject: EmailEnum.confrimEmail })}
    // } catch (error) {
    //     console.log(error);
        
    // }
    
    
})
        userSchema.pre(["findOne","find","countDocuments"],function (){
    // console.log(this.getQuery());
    const query =this.getQuery()
    if(!query.getSoftDelete){

        this.setQuery({...query,deletedAt:{$exists:false}})
    }
    // else{
    //     this.setQuery({...query})
    // }
    
})
    return userSchema

},imports:[SecurityModule]
,inject:[SecurityService]
}])

export default UserModel