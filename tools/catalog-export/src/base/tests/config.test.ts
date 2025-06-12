// (C) 2007-2024 GoodData Corporation
import { beforeEach, describe, vi, it, expect } from "vitest";
import {
    getConfigFromConfigFile,
    getConfigFromEnv,
    getConfigFromOptions,
    mergeConfigs,
    getConfigFromPackage,
} from "../config.js";
import * as fs from "fs/promises";

vi.mock("fs/promises", () => ({
    readFile: vi.fn(),
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("configuration", () => {
    describe("mergeConfigs", () => {
        it("should override the values based on the order", () => {
            const merged = mergeConfigs({ hostname: "old value" }, { hostname: "new value" });

            expect(merged).toEqual({ hostname: "new value" });
        });

        it("should only override with defined, non-null values", () => {
            const merged = mergeConfigs(
                {
                    hostname: "value",
                },
                {
                    hostname: null,
                },
                {
                    hostname: undefined,
                },
            );

            expect(merged).toEqual({ hostname: "value" });
        });

        it("should only output allowed values", () => {
            const merged = mergeConfigs({
                hostname: "https://cloud.gooddata.com/",
                catalogOutput: "./cat.ts",
                workspaceId: "123",
                token: "secret",
                unknown: "value",
                // technically, we can't prevent user from putting random vars in JSON file...
            } as unknown as import("../types.js").CatalogExportConfig);

            expect(merged).toMatchSnapshot();
        });
    });

    describe("getConfigFromEnv", () => {
        it("should parse credentials and ignore everything else", () => {
            const config = getConfigFromEnv({
                TIGER_API_TOKEN: "token",
                RANDOM: "random variable",
            });

            expect(config).toMatchSnapshot();
        });

        it("should return null for credentials if not present in env", () => {
            const config = getConfigFromEnv({});

            expect(config).toMatchSnapshot();
        });
    });

    describe("getConfigFromOptions", () => {
        it("should output allowed values from the input object", () => {
            const config = getConfigFromOptions({
                hostname: "hostname",
                workspaceId: "workspaceId",
                token: "token",
                catalogOutput: "catalogOutput",
            });

            expect(config).toMatchSnapshot();
        });

        it("should ignore empty or non-existing props", () => {
            const config = getConfigFromOptions({});

            expect(config).toEqual({});
        });

        it("should not output additional props", () => {
            const config = getConfigFromOptions({ random: "random" });

            expect(config).toEqual({});
        });
    });

    describe("getConfigFromConfigFile", () => {
        it("should read the given config file and return allowed values from it", async () => {
            vi.spyOn(fs, "readFile").mockResolvedValue(
                JSON.stringify({
                    hostname: "hostname",
                    workspaceId: "workspaceId",
                    catalogOutput: "catalogOutput",
                }),
            );

            await expect(getConfigFromConfigFile("/path/to/config.json")).resolves.toMatchSnapshot();
        });

        it("should return an empty object if there is no config file", async () => {
            vi.spyOn(fs, "readFile").mockResolvedValue(JSON.stringify({}));

            await expect(getConfigFromConfigFile("/path/to/config.json")).resolves.toEqual({});
        });

        it("should not parse credentials out of config file", async () => {
            vi.spyOn(fs, "readFile").mockResolvedValue(
                JSON.stringify({
                    token: "token",
                    username: "username",
                    password: "password",
                }),
            );

            await expect(getConfigFromConfigFile("/path/to/config.json")).resolves.toEqual({});
        });
    });

    describe("getConfigFromPackage", () => {
        it("should parse allowed values from the package.json file in a given folder", async () => {
            vi.spyOn(fs, "readFile").mockResolvedValue(
                JSON.stringify({
                    gooddata: {
                        hostname: "hostname",
                        workspaceId: "workspaceId",
                        catalogOutput: "catalogOutput",
                    },
                }),
            );

            await expect(getConfigFromPackage("/path/to/project")).resolves.toMatchSnapshot();
        });

        it("should override parent folder package.jsons with child ones", async () => {
            vi.spyOn(fs, "readFile").mockImplementation((path: any) => {
                const files: Record<any, string> = {
                    "/path/to/package.json": JSON.stringify({
                        gooddata: {
                            hostname: "hostname",
                            workspaceId: "workspaceId",
                            catalogOutput: "catalogOutput",
                        },
                    }),
                    "/path/to/project/package.json": JSON.stringify({
                        gooddata: {
                            hostname: "hostname-new",
                            workspaceId: "workspaceId-new",
                        },
                    }),
                };

                if (files[path]) return Promise.resolve(files[path]);

                // when file is not found, readFile should return ENOENT error
                const err = new Error("File not found");
                (err as any).code = "ENOENT";
                return Promise.reject(err);
            });

            await expect(getConfigFromPackage("/path/to/project")).resolves.toMatchSnapshot();
        });

        it("should ignore credentials and not supported values", async () => {
            vi.spyOn(fs, "readFile").mockResolvedValue(
                JSON.stringify({
                    gooddata: {
                        hostname: "hostname",
                        workspaceId: "workspaceId",
                        token: "token",
                        random: "random",
                    },
                }),
            );

            await expect(getConfigFromPackage("/path/to/project")).resolves.toMatchSnapshot();
        });

        it("should return an empty object if file does not exist", async () => {
            vi.spyOn(fs, "readFile").mockResolvedValue(JSON.stringify({}));

            await expect(getConfigFromPackage("/path/to/project")).resolves.toEqual({});
        });

        it("should return an empty object if file does not have gooddata property", async () => {
            vi.spyOn(fs, "readFile").mockResolvedValue(
                JSON.stringify({
                    name: "my-package",
                    version: "v1.0.0",
                }),
            );

            await expect(getConfigFromPackage("/path/to/project")).resolves.toEqual({});
        });
    });
});
