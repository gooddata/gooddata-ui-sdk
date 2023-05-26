// (C) 2007-2023 GoodData Corporation
import { getConfigFromOptions } from "../config";
import { CatalogExportConfig } from "../types";

describe("getConfigFromProgram", () => {
    const EMPTY_CONFIG: CatalogExportConfig = {
        hostname: null,
        output: null,
        password: null,
        workspaceId: null,
        username: null,
        backend: null,
    };

    const TEST_DATA: Array<[string, any, CatalogExportConfig | null]> = [
        ["handle empty object", {}, null],
        ["handle object with just some of the needed props", { username: "noone" }, null],
        ["handle case sensitivity", { USERNAME: "not valid", username: "valid" }, null],
        ["complement config from defaults", { username: "valid" }, { ...EMPTY_CONFIG, workspaceId: "abc" }],
        [
            "prefer input over default",
            { username: "valid", workspaceId: "abc" },
            { ...EMPTY_CONFIG, workspaceId: "xyz" },
        ],
        ["propagate bear backend type", { backend: "bear" }, null],
    ];

    it.each(TEST_DATA)("should %s", (_, input: any, defaultOptions: CatalogExportConfig | null) => {
        if (!defaultOptions) {
            expect(getConfigFromOptions(input)).toMatchSnapshot();
        } else {
            expect(getConfigFromOptions(input, defaultOptions)).toMatchSnapshot();
        }
    });
});
