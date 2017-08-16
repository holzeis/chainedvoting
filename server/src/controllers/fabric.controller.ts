"use strict";
import {JsonController, Get} from "routing-controllers";
import {BlockchainClient} from "../blockchain/client/blockchain.client";
import {InvokeReponse} from "../blockchain/channel";

@JsonController("/api/fabric")
export class FabricController {

    public constructor(private blockchainClient: BlockchainClient) {

    }

    @Get("/blocks")
    public async blocks() : Promise<any> {
        console.log("quering blocks of the fabric blockchain.");
        
        return this.blockchainClient.queryBlocks("default");
    }
}

