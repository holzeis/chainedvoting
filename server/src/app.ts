import "reflect-metadata"; 
import {useExpressServer} from 'routing-controllers';
import * as express from 'express';

import {UserController} from './controllers/user.controller';


class App {

    public async run(): Promise<void> {
        const app = express();

        // initialize routing
        useExpressServer(app, {
            controllers: [__dirname + "/controllers/*.js"]
        });

        app.listen(3000);
    }
}


new App().run();