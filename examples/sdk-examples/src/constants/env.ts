// (C) 2019 GoodData Corporation
const backendShortcuts = {
    sec: "https://secure.gooddata.com",
    secure: "https://secure.gooddata.com",
    stg: "https://staging.intgdc.com",
    stg2: "https://staging2.intgdc.com",
    stg3: "https://staging3.intgdc.com",
    demo: "https://client-demo-be.na.intgdc.com",
    developer: "https://developer.na.gooddata.com",
};

const defaultBackend = backendShortcuts.developer;

const backendParam = process.env.backend || "";

export const BACKEND_URL = backendShortcuts[backendParam] || backendParam || defaultBackend;

export const BASEPATH = process.env.basePath || "";

export const ENV_CREDENTIALS = {
    username: process.env.GD_USERNAME,
    password: process.env.GD_PASSWORD,
};
