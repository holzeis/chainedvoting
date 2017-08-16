"use strict";
import {JsonController, Post, Body, Req} from "routing-controllers";
import {BlockchainClient} from "../blockchain/client/blockchain.client";
import {InvokeReponse} from "../blockchain/channel";
import {Poll} from "../models/poll";

@JsonController("/api/poll")
export class PollController {

    public constructor(private blockchainClient: BlockchainClient) {

    }


    @Post("/create")
    public async create(@Body() poll: Poll, @Req() req) : Promise<InvokeReponse> {
        console.log("creating " + poll.name);

        return this.blockchainClient.invoke("default", "createPoll", [JSON.stringify(poll)], "Admin");
    }
}

