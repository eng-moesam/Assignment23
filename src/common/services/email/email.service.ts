import nodemailer from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer/index.js";
import { EmailEnum } from "../../enums/email.enums.js";
import { RedisService } from "../redis/redis.service.js";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SecurityService } from "../security/security.service.js";
import { temblateEmail } from "./email.temblate.js";
import { createOtp } from "./otp.service.js";


@Injectable()
export class MailService {
    private EMAIL: string;
    private EMAIL_APP_PASSWORD: string;

    constructor(private _redisMethods: RedisService,
        private _securityService: SecurityService,
        private _configService: ConfigService


    ) {
        this.EMAIL = _configService.get<string>("EMAIL") as string
        this.EMAIL_APP_PASSWORD = _configService.get<string>("EMAIL_APP_PASSWORD") as string
    }

    sendEmail = async ({ to, cc, bcc, subject, text, html, attachments = [] }:
        {
            to: string | string[],
            cc?: string | string[],
            bcc?: string | string[],
            subject: string,
            text?: string,
            html?: string,
            attachments?: Attachment[]
        }) => {
        // Create a transporter using Ethereal test credentials.
        // For production, replace with your actual SMTP server details.
        const transporter = nodemailer.createTransport({
            service: "gmail",
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
            try{
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

            console.log("Message sent:", info.messageId,info.rejected,info.response);
            return info
        } catch (error) {
            console.log(error);
            throw new BadRequestException("failed to send email");
        }
        })();
    }
    async sendEmailOtp({ email, emailType, subject }: { email: string, emailType: EmailEnum, subject: string }) {

        const prevOtp = await this._redisMethods.ttl(this._redisMethods.getOtpKey({ email, emailType }))
        if (prevOtp > 0) {
            throw new BadRequestException(`There is already OTP expire after ${prevOtp} s`)
        }

        const isBloked = await this._redisMethods.exists(this._redisMethods.getOtpBlockedKey({ email, emailType }))

        if (isBloked) {

            const blockTime = await this._redisMethods.ttl(this._redisMethods.getOtpBlockedKey({ email, emailType })) / 60

            throw new BadRequestException(`you have ablock you can send after ${Math.floor(blockTime)} M`);
        }

        const reqNo = await this._redisMethods.get(this._redisMethods.getOtpSendNO({ email, emailType }))

        if (Number(reqNo) == 5) {
            await this._redisMethods.set({
                key: this._redisMethods.getOtpBlockedKey({ email, emailType }),
                value: 1
                , exValue: 600
            })

            throw new BadRequestException("yon dont send more request 5 email in 20 min  ");

        }

        const otp = createOtp()

        await this.sendEmail({ to: email, subject, html: temblateEmail(otp) })


        await this._redisMethods.set({
            key: this._redisMethods.getOtpKey({ email, emailType }),
            value: await this._securityService.hashOperation({ plaintext: String(otp) }), exValue: 300
        })
        await this._redisMethods.incr(this._redisMethods.getOtpSendNO({ email, emailType }))

    }
}


