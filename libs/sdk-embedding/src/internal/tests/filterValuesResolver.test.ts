// (C) 2021 GoodData Corporation
import { IAbsoluteDateFilter, newAbsoluteDateFilter, uriRef } from "@gooddata/sdk-model";
import { resolveFilterValues } from "../filterValuesResolver";

describe("resolveFilterValues", () => {
    it("should return resolved absolute date limits", async () => {
        const absoluteDateFilter: IAbsoluteDateFilter = newAbsoluteDateFilter(
            uriRef("gdc/md/dfuri"),
            "2020-01-01",
            "2020-02-01",
        );
        const result = await resolveFilterValues([absoluteDateFilter]);
        expect(result).toMatchSnapshot();
    });
});
