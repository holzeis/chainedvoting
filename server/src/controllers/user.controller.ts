'use strict';
import {JsonController, Post, Body, Req} from "routing-controllers";

export interface Response {
    message : string;
}

class UserParams {
    public email: string;
}

@JsonController()
export class UserController {

    @Post("/register")
    public register(@Body() userParams: UserParams, @Req() req) : Response {
        console.log("registering " + userParams.email);
        return <Response> {
            message: "success"
        }
    }
}

