// (C) 2007-2021 GoodData Corporation
import { bearLoad } from "../bearLoad";

jest.mock("@gooddata/api-client-bear");

describe("bearLoad", () => {
    it("should transfer project ID", async () => {
        const result = await bearLoad("test");

        expect(result.workspaceId).toEqual("test");
    });

    it("should load ldm", async () => {
        const result = await bearLoad("test");

        expect(result.catalog).toMatchSnapshot();
    });

    it("should load date data sets", async () => {
        const result = await bearLoad("test");

        expect(result.dateDataSets).toMatchSnapshot();
    });

    it("should load visualizations", async () => {
        const result = await bearLoad("test");

        expect(result.insights).toMatchSnapshot();
    });

    it("should load analytical dashboards", async () => {
        const result = await bearLoad("test");

        expect(result.analyticalDashboards).toMatchSnapshot();
    });
});
