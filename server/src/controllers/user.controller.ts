"use strict";
import {JsonController, Param, Post, Get, Body, Req} from "routing-controllers";
import {BlockchainClient} from "../blockchain/client/blockchain.client";
import {InvokeReponse} from "../blockchain/channel";

import {User} from "../models/user";

@JsonController("/api/users")
export class UserController {

    public constructor(private blockchainClient: BlockchainClient) {

    }

    @Post("/register")
    public async register(@Body() user: User, @Req() req) : Promise<InvokeReponse> {
        console.log("registering " + user.email);

        return this.blockchainClient.invoke("default", "register", [JSON.stringify(user)], "Admin");
    }

    @Get("/login/:email")
    public async login(@Param("email") email: string, @Req() req) : Promise<User> {
        console.log("performing login for " + email);

        var response: InvokeReponse = await this.blockchainClient.invoke("default", "loginUser", [email], "Admin");
        if (!response.success) {
            Promise.reject(response.message);
        }

        return Promise.resolve(response.payload);
    }

    @Get("/")
    public async retrieve() : Promise<User[]> {
        console.log("retrieving all users.");

        return this.blockchainClient.query("default", "allUsers", [], "Admin");
    }
}

