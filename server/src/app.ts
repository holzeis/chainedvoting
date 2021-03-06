import "reflect-metadata";
import {useExpressServer, useContainer} from "routing-controllers";
import {Container} from "typedi";
import * as express from "express";
import * as cors from "cors";
import * as path from "path";
import * as fs from "fs";

import {Blockchain} from "./blockchain/blockchain";
import {BlockchainClient} from "./blockchain/client/blockchain.client";
import {ChaincodeLocalConfig} from "./blockchain/chaincode.local.config";

class App {

    public async run(): Promise<void> {
        // initialize http server
        const app = express();

        // needed for cross resource referencing
        app.use(cors());

        // used for dependency injection
        useContainer(Container);

        // initialize blockchain
        Container.set(BlockchainClient, await this.initializeBlockchain());

        // initialize routing
         useExpressServer(app, {
              // add all constrollers in folder controllers
             controllers: [__dirname + "/controllers/*.js"]
        });

        app.listen(3000, "0.0.0.0", () =>
            console.log("[App]", "App listens on port 3000.")
        );
    }

    private async initializeBlockchain(): Promise<BlockchainClient> {
        const blockchain = new Blockchain(path.join(process.cwd(), "dist"), new ChaincodeLocalConfig().getConfiguration());

        await blockchain.init();
        const blockchainClient = await blockchain.createClient();

        console.log("[App]", "Blockchain client ready to be used");

        return blockchainClient;
    }
}

// start client application
new App().run();
