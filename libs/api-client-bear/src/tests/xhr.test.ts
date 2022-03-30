// (C) 2007-2022 GoodData Corporation
import "isomorphic-fetch";
import fetchMock, { MockOptions } from "fetch-mock";
import isPlainObject from "lodash/isPlainObject";

import { handlePolling, originPackageHeaders, XhrModule, thisPackage } from "../xhr";
import { ConfigModule } from "../config";

function isHashMap(obj: any): obj is { [t: string]: string } {
    return isPlainObject(obj);
}

export function getHeaderValue(request: MockOptions | RequestInit | undefined, name: string): string {
    if (request && isHashMap(request.headers)) {
        return request.headers[name];
    }

    throw new Error(`Could not get header ${name}`);
}

const createXhr = (configStorage = {}) => new XhrModule(fetch, configStorage);

const dummyBody = '{ "test": "ok" }';
const parsedDummyBody = { test: "ok" };

describe("thisPackage", () => {
    it("should equal to current package name and version", () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pkgJson = require("../../package.json");

        expect(thisPackage).toEqual({ name: pkgJson.name, version: pkgJson.version });
    });
});

describe("originPackageHeaders", () => {
    it("should get correct headers", () => {
        const headers = originPackageHeaders({ name: "package", version: "1.0.0" });
        expect(headers).toEqual({ "X-GDC-JS-PKG": "package", "X-GDC-JS-PKG-VERSION": "1.0.0" });
    });
});

describe("createModule", () => {
    it("should use configStorage", () => {
        const configStorage = { xhrSettings: { headers: {} } };
        const xhr = new XhrModule(fetch, configStorage);
        xhr.ajaxSetup({ someSetting: "Run, Forrest, run tests!" });

        expect(configStorage).toEqual({
            xhrSettings: { headers: {}, someSetting: "Run, Forrest, run tests!" },
        });
    });
});

describe("fetch", () => {
    afterEach(() => {
        fetchMock.restore();
    });

    describe("xhr.ajax request", () => {
        it("should handle successful request", () => {
            fetchMock.get("/some/url", { status: 200, body: dummyBody });

            return createXhr()
                .ajax("/some/url")
                .then((r) => {
                    expect(r.response.status).toBe(200);
                    expect(r.getData()).toEqual(parsedDummyBody);
                });
        });

        it("should stringify JSON data for GDC backend", () => {
            fetchMock.get("/some/url", { status: 200 });

            createXhr().ajax("/some/url", { body: { foo: "bar" } });

            const request = fetchMock.calls()[0][1]!;
            expect(request.body).toBe('{"foo":"bar"}');
        });

        it("should handle unsuccessful request", () => {
            fetchMock.get("/some/url", 404);

            return createXhr()
                .ajax("/some/url")
                .then(
                    () => {
                        throw new Error("should be rejected");
                    },
                    (err) => {
                        expect(err.response.status).toBe(404);
                    },
                );
        });

        it("should have accept header set on application/json", () => {
            fetchMock.get("/some/url", 200);

            createXhr().ajax("/some/url");

            expect(getHeaderValue(fetchMock.lastOptions(), "Accept")).toBe("application/json; charset=utf-8");
        });

        it("should set custom headers", () => {
            fetchMock.get("/some/url", 200);

            createXhr().ajax("/some/url", { headers: { "X-GDC-REQUEST": "foo" } });

            const response = fetchMock.lastOptions();

            expect(getHeaderValue(response, "Accept")).toBe("application/json; charset=utf-8");
            expect(getHeaderValue(response, "X-GDC-REQUEST")).toBe("foo");

            // expect(fetchMock.calls().matched[0][1].headers['Accept']).toBe('application/json; charset=utf-8');
            // expect(fetchMock.calls().matched[0][1].headers['X-GDC-REQUEST']).toBe('foo');
        });

        it("should have set package or first set package", () => {
            fetchMock.get("/some/url", 200);

            const configStorage = {};
            const config = new ConfigModule(configStorage);
            const xhr = createXhr(configStorage);

            xhr.ajax("/some/url");

            expect(getHeaderValue(fetchMock.lastOptions(), "X-GDC-JS-PKG")).toBe("@gooddata/api-client-bear");

            config.setJsPackage("@gooddata/react-components", "2.0.0");
            config.setJsPackage("@gooddata/data-layer", "5.0.0");

            xhr.ajax("/some/url");
            expect(getHeaderValue(fetchMock.lastOptions(), "X-GDC-JS-PKG")).toBe(
                "@gooddata/react-components",
            );
            expect(getHeaderValue(fetchMock.lastOptions(), "X-GDC-JS-PKG-VERSION")).toBe("2.0.0");
        });

        it("should add latest REST API version header into the request", () => {
            fetchMock.get("/some/url", 200);

            const xhr = createXhr({});

            xhr.ajax("/some/url");

            expect(getHeaderValue(fetchMock.lastOptions(), "X-GDC-VERSION")).toBe(5);
        });

        it("should log deprecation warning once when REST API call was performed against deprecated version", () => {
            fetchMock.get("/some/url", 200);

            const xhr = createXhr({});

            return xhr.ajax("/some/url").then((result) => {
                expect(result.response.headers.get("X-GDC-DEPRECATED")).toBeNull();
            });
        });

        it("should not log deprecation warning when REST API call was performed against latest REST API", () => {
            const consoleWarnSpy = jest.spyOn(global.console, "warn");
            consoleWarnSpy.mockImplementation(jest.fn());

            fetchMock.get("/some/url", { status: 200, headers: { "X-GDC-DEPRECATED": "deprecated" } });

            const xhr = createXhr({});

            return xhr.ajax("/some/url").then((result) => {
                expect(result.response.headers.get("X-GDC-DEPRECATED")).toEqual("deprecated");

                return xhr.ajax("/some/url").then((result) => {
                    expect(result.response.headers.get("X-GDC-DEPRECATED")).toEqual("deprecated");
                    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

                    consoleWarnSpy.mockRestore();
                });
            });
        });
    });

    describe("xhr.ajax unauthorized handling", () => {
        it("should renew token when TT expires", () => {
            fetchMock.get("/some/url", (url: string) => {
                // for the first time return 401 - simulate no token
                if (fetchMock.calls(url).length === 1) {
                    return 401;
                }
                return 204;
            });

            fetchMock.get("/gdc/account/token", 200);

            return createXhr()
                .ajax("/some/url")
                .then((r) => {
                    expect(r.response.status).toBe(204);
                });
        });

        it("should fail if token renewal fails", () => {
            fetchMock.get("/some/url", 401);
            fetchMock.get("/gdc/account/token", 401);

            return createXhr()
                .ajax("/some/url")
                .then(null, (err) => {
                    expect(err.response.status).toBe(401);
                });
        });

        it("should fail if token renewal fails with error", () => {
            fetchMock.get("/some/url", 401);
            fetchMock.get("/gdc/account/token", 503);

            return createXhr()
                .ajax("/some/url")
                .then(null, (err) => {
                    expect(err.response.status).toBe(503);
                });
        });

        it("should correctly handle multiple requests with token request in progress", () => {
            const firstFailedMatcher = () => {
                if (fetchMock.calls("/some/url/1").length === 1) {
                    return 401;
                }
                return 200;
            };

            fetchMock.get("/some/url/1", firstFailedMatcher);
            fetchMock.get("/some/url/2", firstFailedMatcher);
            fetchMock.get("/gdc/account/token", 200);

            const xhr = createXhr();

            return Promise.all([xhr.ajax("/some/url/1"), xhr.ajax("/some/url/2")]).then((r) => {
                expect(r[0].response.status).toBe(200);
                expect(r[1].response.status).toBe(200);
            });
        });

        it("should call beforeSend in each request including unauthorized", () => {
            const beforeSendStub = jest.fn();
            const url = "/some/url";

            fetchMock.get(url, (url: string) => {
                // for the first time return 401 - simulate no token
                if (fetchMock.calls(url).length === 1) {
                    return 401;
                }
                return 200;
            });
            fetchMock.get("/gdc/account/token", 200);

            const xhr = createXhr();
            xhr.ajaxSetup({ beforeSend: beforeSendStub });

            return xhr.ajax(url).then(() => {
                expect(beforeSendStub).toHaveBeenCalledTimes(3);
            });
        });
    });

    describe("xhr.ajax polling", () => {
        afterEach(() => {
            jest.useRealTimers();
            fetchMock.restore();
        });

        it("should allow for custom setting", () => {
            jest.useFakeTimers();
            const handleRequest = jest.fn(() => Promise.resolve());
            const promise = handlePolling("/some/url", { pollDelay: () => 1000 }, handleRequest);

            jest.advanceTimersByTime(1000); // ms
            expect(handleRequest).toHaveBeenCalledTimes(1);

            return promise;
        });

        it("should retry request after delay", () => {
            fetchMock.get("/some/url", (url) => {
                if (fetchMock.calls(url).length <= 2) {
                    return 202;
                }

                return { status: 200, body: dummyBody };
            });

            return createXhr()
                .ajax("/some/url", { pollDelay: 0 })
                .then((r) => {
                    expect(r.response.status).toBe(200);
                    expect(fetchMock.calls("/some/url").length).toBe(3);
                    expect(r.getData()).toEqual(parsedDummyBody);
                });
        });

        it("should poll on provided url", () => {
            fetchMock.get("/some/url2", {
                status: 200,
                body: dummyBody,
            });

            fetchMock.get("/some/url", {
                status: 202,
                redirectUrl: "/some/url2",
            });

            return createXhr()
                .ajax("/some/url", { pollDelay: 0 })
                .then((r) => {
                    expect(r.response.status).toBe(200);

                    expect(fetchMock.calls("/some/url").length).toBe(1);
                    expect(fetchMock.calls("/some/url2").length).toBe(1);

                    expect(r.getData()).toEqual(parsedDummyBody);
                });
        });

        it("should not poll if client forbids it", () => {
            fetchMock.get("/some/url", (url) => {
                if (fetchMock.calls(url).length <= 2) {
                    return 202;
                }
                return { status: 200, body: "poll result" };
            });

            return createXhr()
                .ajax("/some/url", { pollDelay: 0, dontPollOnResult: true })
                .then((r) => {
                    expect(r.response.status).toBe(202);
                    expect(fetchMock.calls("/some/url").length).toBe(1);
                });
        });

        it("should correctly reject after retry is 404", () => {
            fetchMock.get("/some/url", (url) => {
                if (fetchMock.calls(url).length <= 2) {
                    return 202;
                }
                return 404;
            });

            return createXhr()
                .ajax("/some/url", { pollDelay: 0 })
                .then(null, (err) => {
                    expect(err.response.status).toBe(404);
                });
        });
    });

    describe("xhr.ajax polling with different location", () => {
        it("should retry request after delay", () => {
            fetchMock.get("/some/url", { status: 202, headers: { Location: "/other/url" } });

            fetchMock.get("/other/url", (url) => {
                if (fetchMock.calls(url).length <= 2) {
                    return 202;
                }
                return { status: 200, body: dummyBody };
            });

            return createXhr()
                .ajax("/some/url", { pollDelay: 0 })
                .then((r) => {
                    expect(r.response.status).toBe(200);
                    expect(fetchMock.calls("/some/url").length).toBe(1);
                    expect(fetchMock.calls("/other/url").length).toBe(3);
                    expect(r.getData()).toEqual(parsedDummyBody);
                });
        });

        it("should folow multiple redirects", () => {
            fetchMock.get("/some/url", { status: 202, headers: { Location: "/other/url" } });
            fetchMock.get("/other/url", { status: 202, headers: { Location: "/last/url" } });
            fetchMock.get("/last/url", { status: 200, body: dummyBody });

            return createXhr()
                .ajax("/some/url", { pollDelay: 0 })
                .then((r) => {
                    expect(r.response.status).toBe(200);
                    expect(fetchMock.calls("/some/url").length).toBe(1);
                    expect(fetchMock.calls("/other/url").length).toBe(1);
                    expect(fetchMock.calls("/last/url").length).toBe(1);
                    expect(r.getData()).toEqual(parsedDummyBody);
                });
        });

        it("should correctly reject after retry 404", () => {
            fetchMock.get("/some/url", { status: 202, headers: { Location: "/other/url" } });
            fetchMock.get("/other/url", (url) => {
                if (fetchMock.calls(url).length <= 2) {
                    return 202;
                }
                return 404;
            });

            return createXhr()
                .ajax("/some/url", { pollDelay: 0 })
                .then(null, (err) => {
                    expect(err.response.status).toBe(404);
                    expect(fetchMock.calls("/some/url").length).toBe(1);
                    expect(fetchMock.calls("/other/url").length).toBe(3);
                });
        });
    });

    describe("shortcut methods", () => {
        const data = { message: "THIS IS SPARTA!" };

        beforeEach(() => {
            fetchMock.mock("/url", { status: 200, body: data });
        });

        it("should call xhr.ajax with get method", () => {
            return createXhr()
                .get("/url", {
                    headers: {
                        "Content-Type": "text/csv",
                    },
                })
                .then(() => {
                    const [url, settings] = fetchMock.lastCall("/url")!;
                    expect(url).toBe("/url");
                    expect(settings!.method).toBe("GET");
                    expect(getHeaderValue(settings, "Content-Type")).toBe("text/csv");
                });
        });

        it("should call xhr.ajax with post method", () => {
            return createXhr()
                .post("/url", {
                    data,
                    headers: {
                        "Content-Type": "text/csv",
                    },
                })
                .then(() => {
                    const [url, settings] = fetchMock.lastCall("/url")!;
                    expect(url).toBe("/url");
                    expect(settings!.method).toBe("POST");
                    expect(getHeaderValue(settings, "Content-Type")).toBe("text/csv");
                    expect((settings as RequestInit).body).toBe(JSON.stringify(data));
                });
        });
    });

    describe("enrichSettingWithCustomDomain", () => {
        it("should not touch settings if no domain set", () => {
            fetchMock.get("/test1", 200);

            createXhr().ajax("/test1");

            const [url, settings] = fetchMock.lastCall("/test1")!;
            expect(url).toBe("/test1");
            expect(settings!.credentials).toBe("same-origin");
            expect(settings!.mode).toBe("same-origin");
        });

        it("should add domain before url", () => {
            fetchMock.get("https://domain.tld/test1", 200);

            createXhr({ domain: "https://domain.tld" }).ajax("/test1");

            const [url, settings] = fetchMock.lastCall("https://domain.tld/test1")!;
            expect(url).toBe("https://domain.tld/test1");
            expect(settings!.credentials).toBe("include");
            expect(settings!.mode).toBe("cors");
        });

        it("should not double domain in settings url", () => {
            fetchMock.get("https://domain.tld/test1", 200);

            createXhr({ domain: "https://domain.tld" }).ajax("https://domain.tld/test1");

            const [url, settings] = fetchMock.lastCall("https://domain.tld/test1")!;
            expect(url).toBe("https://domain.tld/test1");
            expect(settings!.credentials).toEqual("include");
            expect(settings!.mode).toEqual("cors");
        });
    });

    describe("beforeSend", () => {
        it("should call beforeSend with settings and url", () => {
            const url = "/some/url";

            fetchMock.get(url, 200);

            const beforeSendStub = jest.fn();
            const xhr = createXhr();

            xhr.ajaxSetup({ beforeSend: beforeSendStub });

            xhr.ajax(url);

            expect(beforeSendStub.mock.calls[0][1]).toEqual(url);
        });
    });
});
