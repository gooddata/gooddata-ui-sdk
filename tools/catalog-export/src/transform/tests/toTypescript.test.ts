// (C) 2007-2020 GoodData Corporation
import { bearLoad } from "../../loaders/bear/bearLoad";
import { transformToTypescript } from "../toTypescript";

jest.mock("@gooddata/api-client-bear");

describe("transformToCatalog", () => {
    const projectMeta = bearLoad("test");

    it("creates new catalog", async () => {
        const transformResult = transformToTypescript(await projectMeta, "testOutput.ts", false);

        /*
         * NOTE: source.getFullText() should not be used here as it includes the leading comments that
         * contains timestamp describing when was the file generated.
         */
        expect(transformResult.sourceFile.getText()).toMatchSnapshot();
    });
});
