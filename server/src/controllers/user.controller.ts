"use strict";
import {JsonController, Post, Body, Req} from "routing-controllers";
import {BlockchainClient} from "../blockchain/client/blockchain.client";
import {InvokeReponse} from "../blockchain/channel";

import {User} from "../models/user";

@JsonController()
export class UserController {

    public constructor(private blockchainClient: BlockchainClient) {

    }


    @Post("/register")
    public async register(@Body() user: User, @Req() req) : Promise<InvokeReponse> {
        console.log("registering " + user.email);

        return this.blockchainClient.invoke("default", "register", [JSON.stringify(user)], "Admin");
    }
}

