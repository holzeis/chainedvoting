"use strict";
import {JsonController, Param, Post, Get, Body, Req} from "routing-controllers";
import {BlockchainClient} from "../blockchain/client/blockchain.client";
import {InvokeReponse} from "../blockchain/channel";

import {Vote} from "../models/vote";

@JsonController("/api/votes")
export class VoteController {

    public constructor(private blockchainClient: BlockchainClient) {

    }

    @Post("/create")
    public async vote(@Body() vote: Vote, @Req() req) : Promise<InvokeReponse> {
        console.log("processing vote for " + vote.option.description + " of poll with id: " + vote.pollID);

        console.log([JSON.stringify(vote)]);

        return this.blockchainClient.invoke("default", "vote", [JSON.stringify(vote)], "Admin");
    }
}

