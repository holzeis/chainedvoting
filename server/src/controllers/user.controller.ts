'use strict';
import {JsonController, Get, Post, Res, Body} from "routing-controllers";

@JsonController()
export class UserController {

    @Get("/")
    public welcome() {
        return <Response> {
            message: "welcome"
        }
    }

    @Post("/register")
    public async register(@Body() email: string) : Promise<Response> {
        console.log("registering " + email);
        return <Response> {
            message: "success"
        }
    }
}

export interface Response {
    message : string;
}