// (C) 2022 GoodData Corporation
import http from "http";
import statik from "node-static";
import { SERVER_PORT, SERVER_URL } from "../constants";

const fileServer = new statik.Server("./dist");

http.createServer(function (request, response) {
    request
        .addListener("end", function () {
            fileServer.serve(request, response, function interceptor(err: any) {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.error("Error serving " + request.url + " - " + err.message);
                    response.writeHead(err.status, err.headers);
                    response.end();
                }
            });
        })
        .resume();
})
    .listen(SERVER_PORT)
    .on("listening", () => {
        // eslint-disable-next-line no-console
        console.info(`Serving app and plugins on ${SERVER_URL}`);
    });
