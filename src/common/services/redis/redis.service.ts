import type { RedisArgument, RedisClientType, SetOptions } from "redis";
import type { EmailEnum } from "../../enums/email.enums";

import type {Types } from "mongoose";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class RedisService{

   constructor( @Inject("Redis_Client") private _clinet : RedisClientType){}

    getBlackListToken({userId,tokenId}:{userId:string|Types.ObjectId,tokenId:string}) {
    return `blackListToken::${userId}::${tokenId}`
}
 getOtpKey({email,emailType}:{email:string,emailType:EmailEnum}) {
    return `OTP::${email}::${emailType}`
}
 getOtpSendNO({email,emailType}:{email:string,emailType:EmailEnum}) {
    return `OTP::${email}::${emailType}::NO`
}
 getOtpBlockedKey({email,emailType}:{email:string,emailType:EmailEnum}) {
    return `OTP::${email}::${emailType}::Blocked`
}

public async  set({key,value,exType="EX",exValue=120}:{key:RedisArgument,value:string|number,exType?: 'EX' | 'PX' | 'EXAT' | 'PXAT',exValue?:number}) {

    return await this._clinet.set(key,value,{
        expiration:{type:exType  , value:Math.floor(exValue)
        },
    })
    
}

public async  incr(key:string) {
    return await this._clinet.incr(key)
}

public async  decr(key:string) {
    return await this._clinet.decr(key)
}


public async  get(key:string) {
    return await this._clinet.get(key)
}
public async  Mget(key:string) {
    const keys = Array.isArray(key) ? key : [key];
    return await this._clinet.mGet(keys)
}

public async  ttl(key:string) {
    return await this._clinet.ttl(key)
}

public async  exists(key:string) {
    return await this._clinet.exists(key)
}

public async  persist(key:string) {
    return await this._clinet.persist(key)
}

public async  del(keys:string|string[]) {
    return await this._clinet.del(keys)
}
public async  update({key,value}:{key:string,value:string|number}) {
    if (!await this.exists(key)){
        return 0;
    }
    await this.set({key, value})
    return 1; 
}
// export async function hset(fields){
//     return await client.hSet(fields)
// }
public async  setExpire(key:string,seconds:number) {
    return await this._clinet.expire(key,seconds)  
}
 getFCMKey(userId:Types.ObjectId | string) {
    return `FCM::${userId}`
}
public async addFCMTokensToSet({userId,FCMToken}:{userId:Types.ObjectId | string,FCMToken:string}){
     return await this._clinet.sAdd(this.getFCMKey(userId),FCMToken)
}
public async getFCMTokensSetMembers(userId:Types.ObjectId | string){
     return await this._clinet.sMembers(this.getFCMKey(userId))
}
 getSocketIoKey(userId:Types.ObjectId | string) {
    return `SocketIoUserIds::${userId}`
}
public async addSocketIoToSet({userId,SocketId}:{userId:Types.ObjectId | string,SocketId:string}){
     return await this._clinet.sAdd(this.getSocketIoKey(userId),SocketId)
}
public async removeSocketId({userId,SocketId}:{userId:Types.ObjectId | string,SocketId:string}){
     return await this._clinet.sRem(this.getSocketIoKey(userId),SocketId)
}
public async getMembersSocketIoIds(userId:Types.ObjectId | string){
     return await this._clinet.sMembers(this.getSocketIoKey(userId))
}
}

