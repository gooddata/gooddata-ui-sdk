// (C) 2021-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataViews } from "@gooddata/sdk-backend-mockingbird";
import { type IDataView } from "@gooddata/sdk-backend-spi";

import { DataViewFacade } from "../../results/facade.js";

import { getAvailableDrillTargets } from "./availableDrillTargets.js";

describe("getAvailableDrillTargets", () => {
    const Scenarios: Array<[string, IDataView]> = recordedDataViews(ReferenceRecordings.Recordings).map(
        (dv) => [dv.name, dv.dataView],
    );

    it.each(Scenarios)("should provide correct available drill targets for: %s", (_desc, dataView) => {
        expect(getAvailableDrillTargets(DataViewFacade.for(dataView))).toMatchSnapshot();
    });

    it("should exclude computed attributes from drill targets", () => {
        const dataView = Scenarios.map(([, view]) => view).find(
            (view) => view.definition.attributes.length > 0,
        );
        expect(dataView).toBeDefined();

        const computedAttribute = dataView!.definition.attributes[0];
        const localIdentifier = computedAttribute.attribute.localIdentifier;
        const dataViewWithComputedAttribute: IDataView = {
            ...dataView!,
            definition: {
                ...dataView!.definition,
                attributes: dataView!.definition.attributes.map((attribute) =>
                    attribute.attribute.localIdentifier === localIdentifier
                        ? {
                              attribute: {
                                  ...attribute.attribute,
                                  displayForm: { identifier: "rep_performance", type: "computedAttribute" },
                              },
                          }
                        : attribute,
                ),
            },
        };

        const result = getAvailableDrillTargets(DataViewFacade.for(dataViewWithComputedAttribute));

        expect(
            result.attributes?.some(
                (item) => item.attribute.attributeHeader.localIdentifier === localIdentifier,
            ),
        ).toBe(false);
    });
});
