import "reflect-metadata"; 
import {useExpressServer} from 'routing-controllers';
import * as express from 'express';
import * as cors from 'cors';

class App {

    public async run(): Promise<void> {
        // initialize http server
        const app = express();

        // needed for cross resource referencing
        app.use(cors());

        // initialize routing
        useExpressServer(app, {
            // add all constrollers in folder controllers
            controllers: [__dirname + "/controllers/*.js"]
        });

        app.listen(3000);
    }
}

// start client application
new App().run();