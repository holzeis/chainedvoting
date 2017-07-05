'use strict';
import {JsonController, Post, Body, Req} from "routing-controllers";
import {BlockchainClient} from '../blockchain/client/blockchain.client';
import {InvokeReponse} from '../blockchain/channel';

export interface Response {
    message : string;
}

class UserParams {
    public email: string;
}

@JsonController()
export class UserController {

    public constructor(private blockchainClient: BlockchainClient) {

    }


    @Post("/register")
    public async register(@Body() userParams: UserParams, @Req() req) : Promise<InvokeReponse> {
        console.log("registering " + userParams.email);

        return this.blockchainClient.invoke("channel", "register", [userParams.email], "Admin");
    }
}

