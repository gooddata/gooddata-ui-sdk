// (C) 2019-2020 GoodData Corporation
const anonymousAccess: any = {
    "https://live-examples-proxy.herokuapp.com/": true,
};

export const ENV_CREDENTIALS = {
    username: process.env.GD_USERNAME,
    password: process.env.GD_PASSWORD,
};

export const ANONYMOUS_ACCESS = anonymousAccess[BACKEND_URL] ?? false;
