// (C) 2007-2019 GoodData Corporation
import { isExportFinished } from "../export";

describe("export utils", () => {
    describe("isExportFinished", () => {
        it("should return true when response ended as success", async () => {
            // tslint:disable-next-line:no-object-literal-type-assertion
            const response = { status: 200 } as Response;
            expect(isExportFinished(response)).toBe(true);
        });

        it("should return false when response ended as bad error", () => {
            // tslint:disable-next-line:no-object-literal-type-assertion
            const response = { status: 400 } as Response;
            expect(isExportFinished(response)).toBe(true);
        });

        it("should return false when response ended as internal error", () => {
            // tslint:disable-next-line:no-object-literal-type-assertion
            const response = { status: 500 } as Response;
            expect(isExportFinished(response)).toBe(true);
        });
    });
});
