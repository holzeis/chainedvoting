import "reflect-metadata";
import {useExpressServer} from "routing-controllers";
import * as express from "express";
import * as cors from "cors";
import * as path from "path";
import * as fs from "fs";
import {Container} from "typedi";

import {Blockchain, DeployPolicy} from "./blockchain/blockchain";
import {BlockchainClient} from "./blockchain/client/blockchain.client";
import {ChaincodeLocalConfig} from "./blockchain/chaincode.local.config";

class App {

    public async run(): Promise<void> {
        // initialize http server
        const app = express();

        // needed for cross resource referencing
        app.use(cors());

        // used for dependency injection
        app.use(Container);

        // initialize blockchain
        Container.set(BlockchainClient, await this.initializeBlockchain());

        // initialize routing
        useExpressServer(app, {
            // add all constrollers in folder controllers
            controllers: [__dirname + "/controllers/*.js"]
        });

        app.listen(3000);
    }

    private async initializeBlockchain(): Promise<BlockchainClient> {
        const blockchain = new Blockchain(path.join(process.cwd(), "dist"), new ChaincodeLocalConfig().getConfiguration());

        await blockchain.init(DeployPolicy.ALWAYS);
        const blockchainClient = await blockchain.createClient();

        console.log("[App]", "Blockchain client ready to be used");

        return blockchainClient;
    }
}

// start client application
new App().run();
