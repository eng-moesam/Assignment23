import nodemailer from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer/index.js";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailSendService{
private  EMAIL:string;
 private EMAIL_APP_PASSWORD:string;
  constructor(private _configService:ConfigService){
         this.EMAIL = _configService.get<string>("EMAIL") as string
         this.EMAIL_APP_PASSWORD=_configService.get<string>("EMAIL_APP_PASSWORD") as string
  }
 sendEmail= async ({to,cc,bcc,subject,text,html,attachments=[]}:
  {to:string|string[],
    cc?:string|string[],
    bcc?:string|string[],
    subject:string,
    text?:string,
    html?:string,
    attachments?:Attachment[]})=>{
    // Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  service:"gmail",
  auth: {
    user: this.EMAIL,
    pass: this.EMAIL_APP_PASSWORD,
  },
  // tls:{
  //   rejectUnauthorized:false
  // }
});

// Send an email using async/await
(async () => {
  const info = await transporter.sendMail({
    from: `"Saraha App" <${this.EMAIL}>`,
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    attachments,
    
  });

  console.log("Message sent:", info.messageId);
})();
}
}





