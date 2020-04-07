// (C) 2020 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");

import { defSetDimensions, defSetSorts } from "..";
import { newArithmeticMeasure, newPopMeasure, newPreviousPeriodMeasure } from "../../measure/factory";
import { Fingerprint } from "../fingerprints";
import { Account, Activity, Velocity, Won } from "../../../../__mocks__/model";
import { attributeIdentifier } from "../../attribute";
import { MeasureGroupIdentifier } from "../../base/dimension";
import {
    newPositiveAttributeFilter,
    newNegativeAttributeFilter,
    newMeasureValueFilter,
    newRelativeDateFilter,
} from "../../filter/factory";
import { localIdRef, idRef } from "../../../objRef/factory";
import { measureIdentifier } from "../../measure";
import { emptyDef, newDefForItems, newDefForBuckets } from "../factory";
import { IMeasureLocatorItem, IAttributeLocatorItem } from "../../base/sort";
import { ITotal } from "../../base/totals";
import { newBucket } from "../../buckets";

describe("Fingerprint", () => {
    const Workspace = "testWorkspace";

    const Account1 = cloneDeep(Account.Default);
    const ACCOUNT_1_LOCAL_ID = "account1";
    Account1.attribute.localIdentifier = ACCOUNT_1_LOCAL_ID;

    const Activity1 = cloneDeep(Activity.Default);
    const ACTIVITY_1_LOCAL_ID = "activity1";
    Activity1.attribute.localIdentifier = ACTIVITY_1_LOCAL_ID;

    const Velocity1 = cloneDeep(Velocity.Sum);
    const VELOCITY_1_LOCAL_ID = "velocity1";
    Velocity1.measure.localIdentifier = VELOCITY_1_LOCAL_ID;

    const Won1 = cloneDeep(Won);
    const WON_1_LOCAL_ID = "won1";
    Won1.measure.localIdentifier = WON_1_LOCAL_ID;

    const Account2 = cloneDeep(Account.Default);
    const ACCOUNT_2_LOCAL_ID = "account2";
    Account2.attribute.localIdentifier = ACCOUNT_2_LOCAL_ID;

    const Activity2 = cloneDeep(Activity.Default);
    const ACTIVITY_2_LOCAL_ID = "activity2";
    Activity2.attribute.localIdentifier = ACTIVITY_2_LOCAL_ID;

    const Velocity2 = cloneDeep(Velocity.Sum);
    const VELOCITY_2_LOCAL_ID = "velocity2";
    Velocity2.measure.localIdentifier = VELOCITY_2_LOCAL_ID;

    const Won2 = cloneDeep(Won);
    const WON_2_LOCAL_ID = "won2";
    Won2.measure.localIdentifier = WON_2_LOCAL_ID;

    describe("workspace handling", () => {
        it("should match equal workspaces", () => {
            const execution1 = emptyDef("foo");
            const execution2 = emptyDef("foo");

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match different workspaces", () => {
            const execution1 = emptyDef("foo");
            const execution2 = emptyDef("bar");

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });
    });

    describe("buckets handling", () => {
        it("should match definitions with identical items but different buckets", () => {
            const execution1 = newDefForItems(Workspace, [Account.Name]);
            const execution2 = newDefForBuckets(Workspace, [newBucket("attr", Account.Name)]);

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });
    });

    describe("simple measures handling", () => {
        it("should match identical definitions", () => {
            const execution = newDefForItems(Workspace, [Velocity1]);

            expect(Fingerprint.forDef(execution)).toEqual(Fingerprint.forDef(execution));
        });

        it("should match identical definitions with different localIds", () => {
            const execution1 = newDefForItems(Workspace, [Velocity1]);
            const execution2 = newDefForItems(Workspace, [Velocity2]);

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should match definition with empty filters with one with no filters at all", () => {
            const VelocityLocalId1EmptyFilters = cloneDeep(Velocity1);
            VelocityLocalId1EmptyFilters.measure.definition.measureDefinition.filters = [];
            const execution1 = newDefForItems(Workspace, [VelocityLocalId1EmptyFilters]);

            const VelocityLocalId1NoFilters = cloneDeep(Velocity1);
            delete VelocityLocalId1NoFilters.measure.definition.measureDefinition.filters;
            const execution2 = newDefForItems(Workspace, [VelocityLocalId1NoFilters]);

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match definition with empty filters with one with filters", () => {
            const VelocityLocalId1EmptyFilters = cloneDeep(Velocity1);
            VelocityLocalId1EmptyFilters.measure.definition.measureDefinition.filters = [];
            const execution1 = newDefForItems(Workspace, [VelocityLocalId1EmptyFilters]);

            const VelocityLocalId1SomeFilters = cloneDeep(Velocity1);
            VelocityLocalId1SomeFilters.measure.definition.measureDefinition.filters = [
                newRelativeDateFilter("foo", "bar", 5, 10),
            ];
            const execution2 = newDefForItems(Workspace, [VelocityLocalId1SomeFilters]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should match definition with computeRatio: false with one with no computeRatio at all", () => {
            const VelocityLocalId1RatioFalse = cloneDeep(Velocity1);
            VelocityLocalId1RatioFalse.measure.definition.measureDefinition.computeRatio = false;
            const execution1 = newDefForItems(Workspace, [VelocityLocalId1RatioFalse]);

            const VelocityLocalId1NoRatio = cloneDeep(Velocity1);
            delete VelocityLocalId1NoRatio.measure.definition.measureDefinition.computeRatio;
            const execution2 = newDefForItems(Workspace, [VelocityLocalId1NoRatio]);

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match definition with computeRatio: false with one with computeRatio: true", () => {
            const VelocityLocalId1RatioFalse = cloneDeep(Velocity1);
            VelocityLocalId1RatioFalse.measure.definition.measureDefinition.computeRatio = false;
            const execution1 = newDefForItems(Workspace, [VelocityLocalId1RatioFalse]);

            const VelocityLocalId1RatioTrue = cloneDeep(Velocity1);
            VelocityLocalId1RatioTrue.measure.definition.measureDefinition.computeRatio = true;
            const execution2 = newDefForItems(Workspace, [VelocityLocalId1RatioTrue]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match definition with different aggregation", () => {
            const VelocityLocalId1Sum = cloneDeep(Velocity1);
            VelocityLocalId1Sum.measure.definition.measureDefinition.aggregation = "sum";
            const execution1 = newDefForItems(Workspace, [VelocityLocalId1Sum]);

            const VelocityLocalId1Avg = cloneDeep(Velocity1);
            VelocityLocalId1Avg.measure.definition.measureDefinition.aggregation = "avg";
            const execution2 = newDefForItems(Workspace, [VelocityLocalId1Avg]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match the same measures in different order", () => {
            const execution1 = newDefForItems(Workspace, [Won1, Velocity1]);
            const execution2 = newDefForItems(Workspace, [Velocity1, Won1]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });
    });

    describe("arithmetic measures handling", () => {
        it("should match identical definitions", () => {
            const execution = newDefForItems(Workspace, [
                Velocity1,
                Won1,
                newArithmeticMeasure([VELOCITY_1_LOCAL_ID, WON_1_LOCAL_ID], "sum"),
            ]);

            expect(Fingerprint.forDef(execution)).toEqual(Fingerprint.forDef(execution));
        });

        it("should match with different localIds pointing to the same items", () => {
            const execution1 = newDefForItems(Workspace, [
                Velocity1,
                Won1,
                newArithmeticMeasure([VELOCITY_1_LOCAL_ID, WON_1_LOCAL_ID], "sum"),
            ]);

            const execution2 = newDefForItems(Workspace, [
                Velocity2,
                Won2,
                newArithmeticMeasure([VELOCITY_2_LOCAL_ID, WON_2_LOCAL_ID], "sum"),
            ]);

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match with different order", () => {
            const execution1 = newDefForItems(Workspace, [
                Velocity1,
                Won1,
                newArithmeticMeasure([VELOCITY_1_LOCAL_ID, WON_1_LOCAL_ID], "sum"),
            ]);

            const execution2 = newDefForItems(Workspace, [
                Velocity2,
                Won2,
                newArithmeticMeasure([WON_2_LOCAL_ID, VELOCITY_2_LOCAL_ID], "sum"),
            ]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match with same localIds pointing to different items", () => {
            const execution1 = newDefForItems(Workspace, [
                Velocity1,
                Won1,
                newArithmeticMeasure([VELOCITY_1_LOCAL_ID, WON_1_LOCAL_ID], "sum"),
            ]);

            const execution2 = newDefForItems(Workspace, [
                { measure: { ...Won2.measure, localIdentifier: VELOCITY_1_LOCAL_ID } },
                Won1,
                newArithmeticMeasure([VELOCITY_1_LOCAL_ID, WON_1_LOCAL_ID], "sum"),
            ]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match with different items", () => {
            const execution1 = newDefForItems(Workspace, [
                Velocity1,
                Won1,
                newArithmeticMeasure([VELOCITY_1_LOCAL_ID, WON_1_LOCAL_ID], "sum"),
            ]);

            const execution2 = newDefForItems(Workspace, [
                Velocity1,
                newArithmeticMeasure([VELOCITY_1_LOCAL_ID, VELOCITY_1_LOCAL_ID], "sum"),
            ]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });
    });

    describe("pop measures handling", () => {
        it("should match identical definitions", () => {
            const execution = newDefForItems(Workspace, [
                Account1,
                Velocity1,
                newPopMeasure(VELOCITY_1_LOCAL_ID, ACCOUNT_1_LOCAL_ID),
            ]);

            expect(Fingerprint.forDef(execution)).toEqual(Fingerprint.forDef(execution));
        });

        it("should match with different localIds pointing to the same items", () => {
            const execution1 = newDefForItems(Workspace, [
                Account1,
                Velocity1,
                newPopMeasure(VELOCITY_1_LOCAL_ID, attributeIdentifier(Account1)!),
            ]);

            const execution2 = newDefForItems(Workspace, [
                Account2,
                Velocity2,
                newPopMeasure(VELOCITY_2_LOCAL_ID, attributeIdentifier(Account2)!),
            ]);

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match with same localIds pointing to different items", () => {
            const execution1 = newDefForItems(Workspace, [
                Account1,
                Velocity1,
                newPopMeasure(VELOCITY_1_LOCAL_ID, attributeIdentifier(Account1)!),
            ]);

            const execution2 = newDefForItems(Workspace, [
                Account2,
                { measure: { ...Won2.measure, localIdentifier: VELOCITY_2_LOCAL_ID } },
                newPopMeasure(VELOCITY_2_LOCAL_ID, attributeIdentifier(Activity2)!),
            ]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });
    });

    describe("previous period measures handling", () => {
        it("should match identical definitions", () => {
            const execution = newDefForItems(Workspace, [
                Account1,
                Won1,
                newPreviousPeriodMeasure(WON_1_LOCAL_ID, [
                    { dataSet: attributeIdentifier(Account1)!, periodsAgo: 2 },
                ]),
            ]);

            expect(Fingerprint.forDef(execution)).toEqual(Fingerprint.forDef(execution));
        });

        it("should match with different localIds pointing to the same items", () => {
            const execution1 = newDefForItems(Workspace, [
                Account1,
                Won1,
                newPreviousPeriodMeasure(WON_1_LOCAL_ID, [
                    { dataSet: attributeIdentifier(Account1)!, periodsAgo: 2 },
                ]),
            ]);

            const execution2 = newDefForItems(Workspace, [
                Account2,
                Won2,
                newPreviousPeriodMeasure(WON_2_LOCAL_ID, [
                    { dataSet: attributeIdentifier(Account2)!, periodsAgo: 2 },
                ]),
            ]);

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match with same localIds pointing to different items", () => {
            const execution1 = newDefForItems(Workspace, [
                Account1,
                Won1,
                newPreviousPeriodMeasure(WON_1_LOCAL_ID, [
                    { dataSet: attributeIdentifier(Account1)!, periodsAgo: 2 },
                ]),
            ]);

            const execution2 = newDefForItems(Workspace, [
                Account2,
                { measure: { ...Velocity2.measure, localIdentifier: WON_1_LOCAL_ID } },
                newPreviousPeriodMeasure(WON_1_LOCAL_ID, [{ dataSet: "bar", periodsAgo: 2 }]),
            ]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });
    });

    describe("attribute handling", () => {
        it("should match identical definitions", () => {
            const execution = newDefForItems(Workspace, [Account1]);

            expect(Fingerprint.forDef(execution)).toEqual(Fingerprint.forDef(execution));
        });

        it("should match attributes pointing to the same item with different localIds", () => {
            const execution1 = newDefForItems(Workspace, [Account1]);
            const execution2 = newDefForItems(Workspace, [Account2]);

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match attributes pointing to different item with the same localIds", () => {
            const execution1 = newDefForItems(Workspace, [Account1]);

            const execution2 = newDefForItems(Workspace, [
                { attribute: { ...Activity1.attribute, localIdentifier: ACCOUNT_1_LOCAL_ID } },
            ]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match the same attributes in different order", () => {
            const execution1 = newDefForItems(Workspace, [Account1, Activity1]);
            const execution2 = newDefForItems(Workspace, [Activity1, Account1]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });
    });

    describe("dimensions handling", () => {
        it("should match identical definitions", () => {
            const execution = defSetDimensions(newDefForItems(Workspace, [Account1]), [
                {
                    itemIdentifiers: [ACCOUNT_1_LOCAL_ID],
                },
            ]);

            expect(Fingerprint.forDef(execution)).toEqual(Fingerprint.forDef(execution));
        });

        it("should match identical definitions with different localIds", () => {
            const execution1 = defSetDimensions(newDefForItems(Workspace, [Account1]), [
                {
                    itemIdentifiers: [ACCOUNT_1_LOCAL_ID],
                },
            ]);

            const execution2 = defSetDimensions(newDefForItems(Workspace, [Account2]), [
                {
                    itemIdentifiers: [ACCOUNT_2_LOCAL_ID],
                },
            ]);

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match different definitions with the same localIds", () => {
            const execution1 = defSetDimensions(newDefForItems(Workspace, [Account1]), [
                {
                    itemIdentifiers: [ACCOUNT_1_LOCAL_ID],
                },
            ]);

            const execution2 = defSetDimensions(
                newDefForItems(Workspace, [
                    { attribute: { ...Activity1.attribute, localIdentifier: ACCOUNT_1_LOCAL_ID } },
                ]),
                [
                    {
                        itemIdentifiers: [ACCOUNT_1_LOCAL_ID],
                    },
                ],
            );

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should match identical definitions with different localIds with 'measureGroup'", () => {
            const execution1 = defSetDimensions(newDefForItems(Workspace, [Account1]), [
                {
                    itemIdentifiers: [ACCOUNT_1_LOCAL_ID, MeasureGroupIdentifier],
                },
            ]);

            const execution2 = defSetDimensions(newDefForItems(Workspace, [Account2]), [
                {
                    itemIdentifiers: [ACCOUNT_2_LOCAL_ID, MeasureGroupIdentifier],
                },
            ]);

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match identical definitions with different localIds with 'measureGroup' with different order", () => {
            const execution1 = defSetDimensions(newDefForItems(Workspace, [Account1]), [
                {
                    itemIdentifiers: [ACCOUNT_1_LOCAL_ID, MeasureGroupIdentifier],
                },
            ]);

            const execution2 = defSetDimensions(newDefForItems(Workspace, [Account2]), [
                {
                    itemIdentifiers: [MeasureGroupIdentifier, ACCOUNT_2_LOCAL_ID],
                },
            ]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should match identical definitions with different localIds with totals", () => {
            const execution1 = defSetDimensions(newDefForItems(Workspace, [Won1, Account1]), [
                {
                    itemIdentifiers: [ACCOUNT_1_LOCAL_ID],
                    totals: [
                        {
                            attributeIdentifier: ACCOUNT_1_LOCAL_ID,
                            measureIdentifier: WON_1_LOCAL_ID,
                            type: "max",
                        },
                    ],
                },
            ]);

            const execution2 = defSetDimensions(newDefForItems(Workspace, [Won2, Account2]), [
                {
                    itemIdentifiers: [ACCOUNT_2_LOCAL_ID],
                    totals: [
                        {
                            attributeIdentifier: ACCOUNT_2_LOCAL_ID,
                            measureIdentifier: WON_2_LOCAL_ID,
                            type: "max",
                        },
                    ],
                },
            ]);

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match different definitions with the same localIds with totals", () => {
            const execution1 = defSetDimensions(newDefForItems(Workspace, [Won1, Account1]), [
                {
                    itemIdentifiers: [ACCOUNT_1_LOCAL_ID],
                    totals: [
                        {
                            attributeIdentifier: ACCOUNT_1_LOCAL_ID,
                            measureIdentifier: WON_1_LOCAL_ID,
                            type: "max",
                        },
                    ],
                },
            ]);

            const execution2 = defSetDimensions(
                newDefForItems(Workspace, [
                    Won2,
                    { attribute: { ...Activity1.attribute, localIdentifier: ACCOUNT_1_LOCAL_ID } },
                ]),
                [
                    {
                        itemIdentifiers: [ACCOUNT_1_LOCAL_ID],
                        totals: [
                            {
                                attributeIdentifier: ACCOUNT_1_LOCAL_ID,
                                measureIdentifier: WON_2_LOCAL_ID,
                                type: "max",
                            },
                        ],
                    },
                ],
            );

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match identical definitions with the same totals in different order", () => {
            const total1: ITotal = {
                attributeIdentifier: ACCOUNT_1_LOCAL_ID,
                measureIdentifier: WON_1_LOCAL_ID,
                type: "max",
            };

            const total2: ITotal = {
                attributeIdentifier: ACCOUNT_1_LOCAL_ID,
                measureIdentifier: WON_1_LOCAL_ID,
                type: "avg",
            };

            const execution1 = defSetDimensions(newDefForItems(Workspace, [Won1, Account1]), [
                {
                    itemIdentifiers: [ACCOUNT_1_LOCAL_ID],
                    totals: [total1, total2],
                },
            ]);

            const execution2 = defSetDimensions(newDefForItems(Workspace, [Won1, Account1]), [
                {
                    itemIdentifiers: [ACCOUNT_1_LOCAL_ID],
                    totals: [total2, total1],
                },
            ]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });
    });

    describe("filters handling", () => {
        it("should match identical definitions", () => {
            const execution = newDefForItems(
                Workspace,
                [Account1],
                [newPositiveAttributeFilter(ACCOUNT_1_LOCAL_ID, ["foo"])],
            );

            expect(Fingerprint.forDef(execution)).toEqual(Fingerprint.forDef(execution));
        });

        it("should match empty negative filter with no filter at all", () => {
            const execution1 = newDefForItems(
                Workspace,
                [Account1],
                [newNegativeAttributeFilter(ACCOUNT_1_LOCAL_ID, [])],
            );

            const execution2 = newDefForItems(Workspace, [Account2], []);

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should match measure value filter without condition with no filter at all", () => {
            const execution1 = newDefForItems(
                Workspace,
                [Won1],
                [{ measureValueFilter: { measure: localIdRef(WON_1_LOCAL_ID) } }],
            );

            const execution2 = newDefForItems(Workspace, [Won2], []);

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should match measure value filter with different localIds", () => {
            const execution1 = newDefForItems(
                Workspace,
                [Won1],
                [newMeasureValueFilter(localIdRef(WON_1_LOCAL_ID), "GREATER_THAN", 5)],
            );

            const execution2 = newDefForItems(
                Workspace,
                [Won2],
                [newMeasureValueFilter(localIdRef(WON_2_LOCAL_ID), "GREATER_THAN", 5)],
            );

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match measure value filter with different operator", () => {
            const execution1 = newDefForItems(
                Workspace,
                [Won1],
                [newMeasureValueFilter(localIdRef(WON_1_LOCAL_ID), "GREATER_THAN", 5)],
            );

            const execution2 = newDefForItems(
                Workspace,
                [Won1],
                [newMeasureValueFilter(localIdRef(WON_1_LOCAL_ID), "EQUAL_TO", 5)],
            );

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match measure value filter with different value", () => {
            const execution1 = newDefForItems(
                Workspace,
                [Won1],
                [newMeasureValueFilter(localIdRef(WON_1_LOCAL_ID), "GREATER_THAN", 5)],
            );

            const execution2 = newDefForItems(
                Workspace,
                [Won1],
                [newMeasureValueFilter(localIdRef(WON_1_LOCAL_ID), "GREATER_THAN", 5000)],
            );

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should match measure value filter with the same identifiers", () => {
            const execution1 = newDefForItems(
                Workspace,
                [Won1],
                [newMeasureValueFilter(idRef(measureIdentifier(Won1)!), "GREATER_THAN", 5)],
            );

            const execution2 = newDefForItems(
                Workspace,
                [Won2],
                [newMeasureValueFilter(idRef(measureIdentifier(Won1)!), "GREATER_THAN", 5)],
            );

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should match the same filters in different order", () => {
            const positiveFilter = newPositiveAttributeFilter(Account1, ["foo"]);
            const negativeFilter = newNegativeAttributeFilter(Account1, ["foo"]);

            const execution1 = newDefForItems(Workspace, [Account1], [positiveFilter, negativeFilter]);
            const execution2 = newDefForItems(Workspace, [Account1], [negativeFilter, positiveFilter]);

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });
    });

    describe("attribute sort items handling", () => {
        it("should match identical definitions", () => {
            const execution = defSetSorts(newDefForItems(Workspace, [Account1]), [
                { attributeSortItem: { attributeIdentifier: ACCOUNT_1_LOCAL_ID, direction: "asc" } },
            ]);

            expect(Fingerprint.forDef(execution)).toEqual(Fingerprint.forDef(execution));
        });

        it("should match identical definitions with different localIds", () => {
            const execution1 = defSetSorts(newDefForItems(Workspace, [Account1]), [
                { attributeSortItem: { attributeIdentifier: ACCOUNT_1_LOCAL_ID, direction: "asc" } },
            ]);

            const execution2 = defSetSorts(newDefForItems(Workspace, [Account2]), [
                { attributeSortItem: { attributeIdentifier: ACCOUNT_2_LOCAL_ID, direction: "asc" } },
            ]);

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match different definitions with the same localIds", () => {
            const execution1 = defSetSorts(newDefForItems(Workspace, [Account1]), [
                { attributeSortItem: { attributeIdentifier: ACCOUNT_1_LOCAL_ID, direction: "asc" } },
            ]);

            const execution2 = defSetSorts(
                newDefForItems(Workspace, [
                    { attribute: { ...Activity1.attribute, localIdentifier: ACCOUNT_1_LOCAL_ID } },
                ]),
                [{ attributeSortItem: { attributeIdentifier: ACCOUNT_1_LOCAL_ID, direction: "asc" } }],
            );

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match identical definitions with different direction", () => {
            const execution1 = defSetSorts(newDefForItems(Workspace, [Account1]), [
                { attributeSortItem: { attributeIdentifier: ACCOUNT_1_LOCAL_ID, direction: "asc" } },
            ]);

            const execution2 = defSetSorts(newDefForItems(Workspace, [Account1]), [
                { attributeSortItem: { attributeIdentifier: ACCOUNT_1_LOCAL_ID, direction: "desc" } },
            ]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match identical definitions with different aggregation", () => {
            const execution1 = defSetSorts(newDefForItems(Workspace, [Account1]), [
                {
                    attributeSortItem: {
                        attributeIdentifier: ACCOUNT_1_LOCAL_ID,
                        direction: "asc",
                        aggregation: "sum",
                    },
                },
            ]);

            const execution2 = defSetSorts(newDefForItems(Workspace, [Account1]), [
                { attributeSortItem: { attributeIdentifier: ACCOUNT_1_LOCAL_ID, direction: "desc" } },
            ]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match identical definitions with different order", () => {
            const execution1 = defSetSorts(newDefForItems(Workspace, [Account1, Activity1]), [
                { attributeSortItem: { attributeIdentifier: ACCOUNT_1_LOCAL_ID, direction: "asc" } },
                { attributeSortItem: { attributeIdentifier: ACTIVITY_1_LOCAL_ID, direction: "asc" } },
            ]);

            const execution2 = defSetSorts(newDefForItems(Workspace, [Account1, Activity1]), [
                { attributeSortItem: { attributeIdentifier: ACTIVITY_1_LOCAL_ID, direction: "asc" } },
                { attributeSortItem: { attributeIdentifier: ACCOUNT_1_LOCAL_ID, direction: "asc" } },
            ]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });
    });

    describe("measure sort items handling", () => {
        const measureLocator: IMeasureLocatorItem = {
            measureLocatorItem: { measureIdentifier: WON_1_LOCAL_ID },
        };

        const attributeLocator: IAttributeLocatorItem = {
            attributeLocatorItem: {
                attributeIdentifier: ACCOUNT_1_LOCAL_ID,
                element: "foo",
            },
        };

        it("should match identical definitions", () => {
            const execution = defSetSorts(newDefForItems(Workspace, [Account1, Won1]), [
                {
                    measureSortItem: {
                        locators: [measureLocator, attributeLocator],
                        direction: "asc",
                    },
                },
            ]);

            expect(Fingerprint.forDef(execution)).toEqual(Fingerprint.forDef(execution));
        });

        it("should match identical definitions with different localIds", () => {
            const execution1 = defSetSorts(newDefForItems(Workspace, [Account1, Won1]), [
                {
                    measureSortItem: {
                        locators: [measureLocator, attributeLocator],
                        direction: "asc",
                    },
                },
            ]);

            const execution2 = defSetSorts(newDefForItems(Workspace, [Account2, Won2]), [
                {
                    measureSortItem: {
                        locators: [
                            { measureLocatorItem: { measureIdentifier: WON_2_LOCAL_ID } },
                            {
                                attributeLocatorItem: {
                                    attributeIdentifier: ACCOUNT_2_LOCAL_ID,
                                    element: "foo",
                                },
                            },
                        ],
                        direction: "asc",
                    },
                },
            ]);

            expect(Fingerprint.forDef(execution1)).toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match identical definitions with different order", () => {
            const execution1 = defSetSorts(newDefForItems(Workspace, [Account1, Won1]), [
                {
                    measureSortItem: {
                        locators: [measureLocator, attributeLocator],
                        direction: "asc",
                    },
                },
            ]);

            const execution2 = defSetSorts(newDefForItems(Workspace, [Account1, Won1]), [
                {
                    measureSortItem: {
                        locators: [attributeLocator, measureLocator],
                        direction: "asc",
                    },
                },
            ]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match different definitions with the same localIds", () => {
            const execution1 = defSetSorts(newDefForItems(Workspace, [Account1, Won1]), [
                {
                    measureSortItem: {
                        locators: [measureLocator, attributeLocator],
                        direction: "asc",
                    },
                },
            ]);

            const execution2 = defSetSorts(
                newDefForItems(Workspace, [
                    { attribute: { ...Activity1.attribute, localIdentifier: ACCOUNT_1_LOCAL_ID } },
                    Won1,
                ]),
                [
                    {
                        measureSortItem: {
                            locators: [measureLocator, attributeLocator],
                            direction: "asc",
                        },
                    },
                ],
            );

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match identical definitions with different element", () => {
            const execution1 = defSetSorts(newDefForItems(Workspace, [Account1, Won1]), [
                {
                    measureSortItem: {
                        locators: [measureLocator, attributeLocator],
                        direction: "asc",
                    },
                },
            ]);

            const execution2 = defSetSorts(newDefForItems(Workspace, [Account1, Won1]), [
                {
                    measureSortItem: {
                        locators: [
                            measureLocator,
                            {
                                attributeLocatorItem: {
                                    attributeIdentifier: ACCOUNT_1_LOCAL_ID,
                                    element: "bar",
                                },
                            },
                        ],
                        direction: "asc",
                    },
                },
            ]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });

        it("should NOT match identical definitions with different direction", () => {
            const execution1 = defSetSorts(newDefForItems(Workspace, [Account1, Won1]), [
                {
                    measureSortItem: {
                        locators: [measureLocator, attributeLocator],
                        direction: "asc",
                    },
                },
            ]);

            const execution2 = defSetSorts(newDefForItems(Workspace, [Account1, Won1]), [
                {
                    measureSortItem: {
                        locators: [measureLocator, attributeLocator],
                        direction: "desc",
                    },
                },
            ]);

            expect(Fingerprint.forDef(execution1)).not.toEqual(Fingerprint.forDef(execution2));
        });
    });

    describe("cycles detection", () => {
        it("should NOT end in an infinite loop for cyclic inputs", () => {
            const cyclic = newDefForItems(Workspace, [
                Won1,
                newArithmeticMeasure([Won1, "C"], "sum", m => m.localId("A")),
                newArithmeticMeasure([Won1, "A"], "sum", m => m.localId("B")),
                newArithmeticMeasure([Won1, "B"], "sum", m => m.localId("C")),
            ]);

            expect(() => Fingerprint.forDef(cyclic)).toThrow();
        });
    });
});
