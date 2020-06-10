// (C) 2007-2020 GoodData Corporation
import { getConfigFromProgram } from "../config";
import { CatalogExportConfig } from "../types";

describe("getConfigFromProgram", () => {
    const EMPTY_CONFIG: CatalogExportConfig = {
        projectName: null,
        hostname: null,
        output: null,
        password: null,
        projectId: null,
        username: null,
        backend: null,
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
            { username: "valid", projectId: "abc" },
            { ...EMPTY_CONFIG, projectId: "xyz" },
        ],
        ["propagate tiger backend type", { backend: "tiger" }, null],
    ];

    it.each(TEST_DATA)("should %s", (_, input: any, defaultOptions: CatalogExportConfig | null) => {
        if (!defaultOptions) {
            expect(getConfigFromProgram(input)).toMatchSnapshot();
        } else {
            expect(getConfigFromProgram(input, defaultOptions)).toMatchSnapshot();
        }
    });
});
