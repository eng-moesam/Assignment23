import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { compare ,hash} from "bcrypt";
// import { hash } from "crypto";
import CryptoJS from "crypto-js";
import { ENCRPTION_KEY, SALT_ROUNDS } from "src/config/config.service";


@Injectable()
export class SecurityService{

      constructor (private _configService:ConfigService){}
    encryptValue({ value, encrotionKey =this._configService.get<string>('ENCRPTION_KEY') }: { value: string, encrotionKey?: string }) {
            return CryptoJS.AES.encrypt(value, encrotionKey!).toString();
     
}

 decryptValue({ value, encrotionKey = this._configService.get<string>('ENCRPTION_KEY')  }: { value: string, encrotionKey?: string }) {
     const bytes = CryptoJS.AES.decrypt(value, encrotionKey!);
     const originalText = bytes.toString(CryptoJS.enc.Utf8);
     return originalText

}


 async  hashOperation({plaintext , round = Number(this._configService.get<string>('SALT_ROUNDS'))}:{plaintext:string,round?:number}) {

   return await hash( plaintext , round )
    
}
 async  compareOperation({plaintext,hashedvalue}:{plaintext:string,hashedvalue:string}) {

    return await compare(plaintext,hashedvalue)
    
}
}