// (C) 2007-2021 GoodData Corporation

import { withNormalization } from "../index";
import { dummyBackend, dummyBackendEmptyData } from "../../dummyBackend";
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { NoDataError } from "@gooddata/sdk-backend-spi";

describe("withNormalization", () => {
    const measures = [
        ReferenceLdm.Won,
        ReferenceLdm.Amount,
        ReferenceLdmExt.WonPopClosedYear,
        ReferenceLdmExt.WonPreviousPeriod,
        ReferenceLdmExt.AmountWithRatio,
        ReferenceLdmExt.MaxAmount,
        ReferenceLdmExt.CalculatedLost,
    ];

    const attributes = [ReferenceLdm.Region, ReferenceLdm.Product.Name];

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
