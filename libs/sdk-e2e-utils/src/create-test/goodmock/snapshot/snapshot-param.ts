// (C) 2026 GoodData Corporation

export const snapshotParams = {
    captureHeaders: { "X-GDC-TEST-NAME": {} },
    requestBodyPattern: {
        matcher: "equalToJson",
        ignoreArrayOrder: false,
        ignoreExtraElements: false,
    },
};
