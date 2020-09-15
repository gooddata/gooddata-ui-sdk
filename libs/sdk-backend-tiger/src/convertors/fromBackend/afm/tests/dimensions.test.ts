// (C) 2020 GoodData Corporation

import { transformResultDimensions } from "../dimensions";
import { mockDimensions } from "./dimensions.fixture";
import { emptyDef, idRef, newDefForItems, newMeasure } from "@gooddata/sdk-model";

describe("transformResultDimensions", () => {
    it("should fill in uris and refs for attribute descriptors", () => {
        expect(transformResultDimensions(mockDimensions, emptyDef("test"))).toMatchSnapshot();
    });

    it("should fill in uris and refs for attribute descriptors and simple measure descriptors", () => {
        expect(
            transformResultDimensions(
                mockDimensions,
                newDefForItems("test", [
                    newMeasure(idRef("measureIdentifier", "measure"), (m) => m.localId("measureLocalId")),
                ]),
            ),
        ).toMatchSnapshot();
    });
});
