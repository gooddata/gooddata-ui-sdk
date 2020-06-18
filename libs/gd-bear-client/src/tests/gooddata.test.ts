// (C) 2007-2020 GoodData Corporation
import "isomorphic-fetch";
import fetchMock from "fetch-mock";
import { factory } from "../gooddata";

const createSDK = (config = {}) => factory(fetch)(config);

const modules = ["catalogue", "config", "md", "project", "user", "xhr", "utils"];

describe("factory", () => {
    afterEach(() => {
        fetchMock.restore();
    });

    it("should create instance of SDK", () => {
        fetchMock.mock("/some/url", { status: 200, body: "hello" });

        const sdk = createSDK();

        modules.forEach((m) => expect(sdk).toHaveProperty(m));

        return sdk.xhr
            .ajax("/some/url")
            .then((response) => {
                expect(response.response.status).toBe(200);
                return response.responseBody;
            })
            .then((body) => {
                expect(body).toBe("hello");
            });
    });

    it("should create clone()", () => {
        const sdk1 = createSDK();
        sdk1.config.setCustomDomain("beddata.com");

        const sdk2 = sdk1.clone();
        expect(sdk2.config.getCustomDomain()).toEqual("https://beddata.com");

        sdk2.config.setCustomDomain("chairdata.com");
        expect(sdk1.config.getCustomDomain()).toEqual("https://beddata.com");
        expect(sdk2.config.getCustomDomain()).toEqual("https://chairdata.com");
    });

    it("should create instances with custom domains", () => {
        fetchMock.mock("https://staging3.intgdc.com/some/url", { status: 200, body: "hello from stg3" });
        fetchMock.mock("https://staging2.intgdc.com/some/url", { status: 200, body: "hello from stg2" });

        const sdkStg3 = createSDK({ domain: "staging3.intgdc.com" });
        const sdkStg2 = createSDK({ domain: "staging2.intgdc.com" });

        expect(sdkStg3.config.getCustomDomain()).toEqual("https://staging3.intgdc.com");
        expect(sdkStg2.config.getCustomDomain()).toEqual("https://staging2.intgdc.com");

        return Promise.all([
            sdkStg3.xhr
                .ajax("/some/url")
                .then((r) => r.responseBody)
                .then((body) => {
                    expect(body).toEqual("hello from stg3");
                }),
            sdkStg2.xhr
                .ajax("/some/url")
                .then((r) => r.responseBody)
                .then((body) => {
                    expect(body).toEqual("hello from stg2");
                }),
        ]);
    });

    it("should export static utilities", () => {
        const sdk = createSDK();

        expect(sdk.utils).toMatchObject({
            getAttributesDisplayForms: expect.any(Function),
        });
    });
});
