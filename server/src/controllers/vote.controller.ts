"use strict";
import {JsonController, Param, Post, Get, Body, Req} from "routing-controllers";
import {BlockchainClient} from "../blockchain/client/blockchain.client";
import {InvokeReponse} from "../blockchain/channel";

import {Vote} from "../models/vote";

@JsonController("/api/votes")
export class VoteController {

    public constructor(private blockchainClient: BlockchainClient) {

    }

    @Post("/vote")
    public async vote(@Body() vote: Vote, @Req() req) : Promise<InvokeReponse> {
        console.log("processing vote for " + vote.option.description + " of poll with id: " + vote.pollID);

        return this.blockchainClient.invoke("default", "vote", [JSON.stringify(vote)], "Admin");
    }

    @Post("/delegate")
    public async delegate(@Body() delegate: Vote, @Req() req) : Promise<InvokeReponse> {
        console.log("delegating vote from " + delegate.voter + " to " + delegate.delegate);

        return this.blockchainClient.invoke("default", "delegate", [JSON.stringify(delegate)], "Admin")
    }
    
    @Get("/")
    public async retrieve() : Promise<Vote[]> {
        console.log("retrieving all votes");

        return this.blockchainClient.query("default", "allVotes", [], "Admin");
    }
}

