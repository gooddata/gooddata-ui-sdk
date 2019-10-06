// (C) 2007-2018 GoodData Corporation
import * as headerPredicateFactory from "../../factory/HeaderPredicateFactory";
import { context, measureHeaders } from "../../factory/tests/HeaderPredicateFactory.mock";
import { IMappingHeader } from "../../interfaces/MappingHeader";
import { IHeaderPredicate2 } from "../../interfaces/HeaderPredicate";
import { convertDrillableItemsToPredicates2, isSomeHeaderPredicateMatched2 } from "../drilling";
import { emptyFacade } from "../../../../__mocks__/fixtures";

describe("isSomeHeaderPredicateMatched", () => {
    it("should return true when some of predicates match header", () => {
        const header: IMappingHeader = { attributeHeaderItem: { uri: "uri", name: "name" } };
        const drillablePredicates: IHeaderPredicate2[] = [jest.fn(() => false), jest.fn(() => true)];

        expect(isSomeHeaderPredicateMatched2(drillablePredicates, header, emptyFacade)).toBe(true);
        expect(drillablePredicates[0]).toBeCalledWith(header, {
            dv: emptyFacade,
        });
        expect(drillablePredicates[1]).toBeCalledWith(header, {
            dv: emptyFacade,
        });
    });

    it("should return false when none of predicates match header", () => {
        const header: IMappingHeader = { attributeHeaderItem: { uri: "uri", name: "name" } };
        const drillablePredicates: IHeaderPredicate2[] = [jest.fn(() => false), jest.fn(() => false)];

        expect(isSomeHeaderPredicateMatched2(drillablePredicates, header, emptyFacade)).toBe(false);
        expect(drillablePredicates[0]).toBeCalledWith(header, {
            dv: emptyFacade,
        });
        expect(drillablePredicates[1]).toBeCalledWith(header, {
            dv: emptyFacade,
        });
    });

    it("should return false when no of predicates provided", () => {
        const header: IMappingHeader = { attributeHeaderItem: { uri: "uri", name: "name" } };
        const drillablePredicates: IHeaderPredicate2[] = [];

        expect(isSomeHeaderPredicateMatched2(drillablePredicates, header, emptyFacade)).toBe(false);
    });
});

describe("convertDrillableItemsToPredicates", () => {
    it("should convert legacy drillable items to drillable predicates", () => {
        const drillableItems = [{ uri: "/some-uri" }, { identifier: "some-identifier" }];

        const drillablePredicates = convertDrillableItemsToPredicates2(drillableItems);

        expect(drillablePredicates).toHaveLength(drillableItems.length);
        drillablePredicates.forEach(predicate => {
            expect(typeof predicate).toBe("function");
            expect(typeof predicate(measureHeaders.uriBasedMeasure, context)).toBe("boolean");
        });
    });

    it("should convert legacy drillable items with drillable predicates to drillable predicates", () => {
        const drillableItems = [
            { uri: "/some-uri" },
            { identifier: "some-identifier" },
            headerPredicateFactory.uriMatch("/some-uri"),
            headerPredicateFactory.identifierMatch("identifier"),
        ];

        const drillablePredicates = convertDrillableItemsToPredicates2(drillableItems);

        expect(drillablePredicates).toHaveLength(drillableItems.length);
        drillablePredicates.forEach(predicate => {
            expect(typeof predicate).toBe("function");
            expect(typeof predicate(measureHeaders.uriBasedMeasure, context)).toBe("boolean");
        });
    });

    it("should match converted legacy drillable item with uri", () => {
        const drillableItems = [{ uri: "/uriBasedMeasureUri" }];

        const [predicate] = convertDrillableItemsToPredicates2(drillableItems);
        expect(predicate(measureHeaders.uriBasedMeasure, context)).toEqual(true);
    });

    it("should match converted legacy drillable item with identifier", () => {
        const drillableItems = [{ identifier: "uriBasedMeasureIdentifier" }];

        const [predicate] = convertDrillableItemsToPredicates2(drillableItems);
        expect(predicate(measureHeaders.uriBasedMeasure, context)).toEqual(true);
    });

    it("should match both converted legacy drillable items with identifier and uri", () => {
        const drillableItems = [
            {
                uri: "/uriBasedMeasureUri",
                identifier: "uriBasedMeasureIdentifier",
            },
        ];

        const drillablePredicates = convertDrillableItemsToPredicates2(drillableItems);
        drillablePredicates.forEach(predicate => {
            expect(predicate(measureHeaders.uriBasedMeasure, context)).toEqual(true);
        });
    });
});
