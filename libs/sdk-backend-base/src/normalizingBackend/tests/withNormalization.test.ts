// (C) 2007-2020 GoodData Corporation

import { withNormalization } from "../index";
import { dummyBackendEmptyData } from "../../dummyBackend";
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";

describe("withNormalization", () => {
    it("should keep transparency of exec definition", async () => {
        const backend = withNormalization(dummyBackendEmptyData());
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

        const result = await backend
            .workspace("testWorkspace")
            .execution()
            .forItems([...attributes, ...measures])
            .execute();

        expect(result.definition.attributes).toEqual(attributes);
        expect(result.definition.measures).toEqual(measures);
    });
});
