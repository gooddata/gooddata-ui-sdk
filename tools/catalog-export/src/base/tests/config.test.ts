// (C) 2007-2022 GoodData Corporation
import { getConfigFromOptions } from "../config";
import { CatalogExportConfig } from "../types";

describe("getConfigFromProgram", () => {
    const EMPTY_CONFIG: CatalogExportConfig = {
        projectName: null,
        workspaceName: null,
        hostname: null,
        output: null,
        password: null,
        projectId: null,
        workspaceId: null,
        username: null,
        backend: null,
        demo: false,
    };

    const TEST_DATA: Array<[string, any, CatalogExportConfig | null]> = [
        ["handle empty object", {}, null],
        ["handle object with just some of the needed props", { username: "noone" }, null],
        ["handle case sensitivity", { USERNAME: "not valid", username: "valid" }, null],
        [
            "complement config from defaults",
            { username: "valid" },
            { ...EMPTY_CONFIG, projectName: "project" },
        ],
        [
            "prefer input over default",
            { username: "valid", projectId: "abc", workspaceId: "abc" },
            { ...EMPTY_CONFIG, projectId: "xyz", workspaceId: "abc" },
        ],
        ["propagate tiger backend type", { backend: "tiger" }, null],
    ];

    it.each(TEST_DATA)("should %s", (_, input: any, defaultOptions: CatalogExportConfig | null) => {
        if (!defaultOptions) {
            expect(getConfigFromOptions(input)).toMatchSnapshot();
        } else {
            expect(getConfigFromOptions(input, defaultOptions)).toMatchSnapshot();
        }
    });
});
