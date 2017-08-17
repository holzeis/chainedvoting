"use strict";
import {JsonController, Param, Post, Get, Body, Req} from "routing-controllers";
import {BlockchainClient} from "../blockchain/client/blockchain.client";
import {InvokeReponse} from "../blockchain/channel";
import {Poll} from "../models/poll";

@JsonController("/api/polls")
export class PollController {

    public constructor(private blockchainClient: BlockchainClient) {

    }


    @Post("/create")
    public async create(@Body() poll: Poll, @Req() req) : Promise<InvokeReponse> {
        console.log("creating " + poll.name);        

        return this.blockchainClient.invoke("default", "createPoll", [JSON.stringify(poll)], "Admin");
    }


    @Get("/")
    public async retrieve() : Promise<Poll[]> {
        console.log("retrieving all polls");

        return this.blockchainClient.query("default", "allPolls", [], "Admin");
    }

    @Get("/:id")
    public async retrievePoll(@Param("id") id: string, @Req() req) : Promise<Poll> {
        console.log("retrieving poll with id " + id);

        return this.blockchainClient.query("default", "getPoll", [id], "Admin");
    }
}

