// (C) 2007-2024 GoodData Corporation
import { describe, it, expect } from "vitest";
import { withNormalization } from "../index.js";
import { dummyBackend, dummyBackendEmptyData } from "../../dummyBackend/index.js";
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { NoDataError } from "@gooddata/sdk-backend-spi";

describe("withNormalization", () => {
    const measures = [
        ReferenceMd.Won,
        ReferenceMd.Amount,
        ReferenceMdExt.WonPopClosedYear,
        ReferenceMdExt.WonPreviousPeriod,
        ReferenceMdExt.AmountWithRatio,
        ReferenceMdExt.MaxAmount,
        ReferenceMdExt.CalculatedLost,
    ];

    const attributes = [ReferenceMd.Region.Default, ReferenceMd.Product.Name];

    it("should keep transparency of exec definition", async () => {
        const backend = withNormalization(dummyBackendEmptyData());

        const result = await backend
            .workspace("testWorkspace")
            .execution()
            .forItems([...attributes, ...measures])
            .execute();

        expect(result.definition.attributes).toEqual(attributes);
        expect(result.definition.measures).toEqual(measures);
    });

    it("should keep transparency of exec definition in case of no data error (RAIL-3232)", async () => {
        const backend = withNormalization(
            dummyBackend({
                // make sure the dataView is passed to the NoDataError
                raiseNoDataExceptions: "with-data-view",
            }),
        );

        const result = await backend
            .workspace("testWorkspace")
            .execution()
            .forItems([...attributes, ...measures])
            .execute();

        try {
            await result.readAll();
        } catch (err) {
            const typedError = err as NoDataError;
            expect(typedError.dataView?.definition.attributes).toEqual(attributes);
            expect(typedError.dataView?.definition.measures).toEqual(measures);
        }
    });
});
