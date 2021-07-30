// (C) 2021 GoodData Corporation
const axios = require("axios");
const waitOn = require("wait-on");

async function wiremockWait(wiremockHost) {
    return waitOn({
        resources: [`http-get://${wiremockHost}/__admin`],
        interval: 2000,
    });
}

async function wiremockStartRecording(wiremockHost, appHost) {
    return axios.post(`http://${wiremockHost}/__admin/mappings`, {
        request: {
            method: "ANY",
            urlPathPattern: "/.*",
        },
        response: {
            proxyBaseUrl: `https://${appHost}`,
        },
    });
}

async function wiremockStopRecording(wiremockHost) {
    const commonSnapshotParams = {
        captureHeaders: {
            "X-GDC-TEST-RECORD-SCENARIO": {},
        },
        requestBodyPattern: {
            matcher: "equalToJson",
            ignoreArrayOrder: false,
            ignoreExtraElements: false,
        },
    };

    // persist execution results requests with scenarios
    await axios.post(`http://${wiremockHost}/__admin/recordings/snapshot`, {
        filters: {
            headers: {
                "X-GDC-TEST-RECORD-SCENARIO": {
                    matches: ".+",
                },
            },
        },
        repeatsAsScenarios: true,
        ...commonSnapshotParams,
    });

    // persist other requests without scenarios
    return axios.post(`http://${wiremockHost}/__admin/recordings/snapshot`, {
        filters: {
            headers: {
                "X-GDC-TEST-RECORD-SCENARIO": {
                    absent: true,
                },
            },
        },
        repeatsAsScenarios: false,
        ...commonSnapshotParams,
    });
}

async function wiremockMockLogRequests(wiremockHost) {
    return axios.post(`http://${wiremockHost}/__admin/mappings`, {
        request: {
            method: "POST",
            urlPattern: "/gdc/app/projects/.*/log",
        },
        response: {
            body: "",
            status: 200,
        },
    });
}

module.exports = {
    wiremockWait,
    wiremockStartRecording,
    wiremockStopRecording,
    wiremockMockLogRequests,
};
