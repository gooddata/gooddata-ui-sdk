// (C) 2007-2023 GoodData Corporation
import {
    getConfigFromConfigFile,
    getConfigFromEnv,
    getConfigFromOptions,
    mergeConfigs,
    getConfigFromPackage,
} from "../config";

jest.mock("fs/promises");

let fs: typeof import("./__mocks__/fs/promises").default;

describe("configuration", () => {
    beforeAll(async () => {
        // Mocking FS does not work well with TypeScript..
        fs = (await import("fs/promises"))
            .default as unknown as typeof import("./__mocks__/fs/promises").default;
    });

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
                backend: "tiger",
                catalogOutput: "./cat.ts",
                workspaceId: "123",
                username: "tomas",
                password: "secret",
                token: "secret",
                unknown: "value",
                // technically, we can't prevent user from putting random vars in JSON file...
            } as unknown as import("../types").CatalogExportConfig);

            expect(merged).toMatchSnapshot();
        });
    });

    describe("getConfigFromEnv", () => {
        it("should parse credentials and ignore everything else", () => {
            const config = getConfigFromEnv({
                GDC_USERNAME: "username",
                GDC_PASSWORD: "password",
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
                username: "username",
                password: "password",
                token: "token",
                catalogOutput: "catalogOutput",
                backend: "backend",
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
            fs.__setMockFiles({
                "/path/to/config.json": JSON.stringify({
                    hostname: "hostname",
                    workspaceId: "workspaceId",
                    catalogOutput: "catalogOutput",
                    backend: "backend",
                }),
            });

            await expect(getConfigFromConfigFile("/path/to/config.json")).resolves.toMatchSnapshot();
        });

        it("should return an empty object if there is no config file", async () => {
            fs.__setMockFiles({});

            await expect(getConfigFromConfigFile("/path/to/config.json")).resolves.toEqual({});
        });

        it("should not parse credentials out of config file", async () => {
            fs.__setMockFiles({
                "/path/to/config.json": JSON.stringify({
                    token: "token",
                    username: "username",
                    password: "password",
                }),
            });

            await expect(getConfigFromConfigFile("/path/to/config.json")).resolves.toEqual({});
        });
    });

    describe("getConfigFromPackage", () => {
        it("should parse allowed values from the package.json file in a given folder", async () => {
            fs.__setMockFiles({
                "/path/to/project/package.json": JSON.stringify({
                    gooddata: {
                        hostname: "hostname",
                        workspaceId: "workspaceId",
                        catalogOutput: "catalogOutput",
                        backend: "backend",
                    },
                }),
            });

            await expect(getConfigFromPackage("/path/to/project")).resolves.toMatchSnapshot();
        });

        it("should override parent folder package.jsons with child ones", async () => {
            fs.__setMockFiles({
                "/path/to/package.json": JSON.stringify({
                    gooddata: {
                        hostname: "hostname",
                        workspaceId: "workspaceId",
                        catalogOutput: "catalogOutput",
                        backend: "backend",
                    },
                }),
                "/path/to/project/package.json": JSON.stringify({
                    gooddata: {
                        hostname: "hostname-new",
                        workspaceId: "workspaceId-new",
                    },
                }),
            });

            await expect(getConfigFromPackage("/path/to/project")).resolves.toMatchSnapshot();
        });

        it("should ignore credentials and not supported values", async () => {
            fs.__setMockFiles({
                "/path/to/project/package.json": JSON.stringify({
                    gooddata: {
                        hostname: "hostname",
                        workspaceId: "workspaceId",
                        token: "token",
                        username: "username",
                        password: "password",
                        random: "random",
                    },
                }),
            });

            await expect(getConfigFromPackage("/path/to/project")).resolves.toMatchSnapshot();
        });

        it("should return an empty object if file does not exist", async () => {
            fs.__setMockFiles({});

            await expect(getConfigFromPackage("/path/to/project")).resolves.toEqual({});
        });
        it("should return an empty object if file does not have gooddata property", async () => {
            fs.__setMockFiles({
                "/path/to/project/package.json": JSON.stringify({
                    name: "my-package",
                    version: "v1.0.0",
                }),
            });

            await expect(getConfigFromPackage("/path/to/project")).resolves.toEqual({});
        });
    });
});
