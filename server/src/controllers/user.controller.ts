'use strict';
import {JsonController, Get, Post, Res, Body} from "routing-controllers";

class UserParams {
    public email: string;
}

@JsonController()
export class UserController {

    @Get("/")
    public welcome() {
        return <Response> {
            message: "welcome"
        }
    }

    @Post("/register")
    public register(@Body() userParams: UserParams) : Response {
        console.log("registering " + userParams.email);
        return <Response> {
            message: "success"
        }
    }
}

export interface Response {
    message : string;
}