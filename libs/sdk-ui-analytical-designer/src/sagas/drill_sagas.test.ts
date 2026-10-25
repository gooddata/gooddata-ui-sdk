// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { select } from "redux-saga/effects";
import { describe, it } from "vitest";

import { type IDataView } from "@gooddata/sdk-backend-spi";
import { uriRef } from "@gooddata/sdk-model";
import { type IDrillEvent } from "@gooddata/sdk-ui";

import { createDrillPerformedAction } from "../actions/drill_actions.js";
import { drillPerformed as drillPerformedEvent } from "../postMessageApi/outgoing/drill_events.js";
import { initialState } from "../reducers/initial_state.js";
import { getIsEmbedded } from "../selectors/meta_selector.js";

import { drillPerformed } from "./drill_sagas.js";

describe("Drill sagas", () => {
    describe("drill performed", () => {
        const drillEvent: IDrillEvent = {
            dataView: {
                definition: {
                    workspace: "mockproject",
                    filters: [],
                    buckets: [],
                    dimensions: [],
                    sortBy: [],
                    measures: [
                        {
                            measure: {
                                localIdentifier: "m1",
                                definition: {
                                    measureDefinition: {
                                        item: { uri: "/gdc/md/mockproject/obj/metric.amount" },
                                    },
                                },
                                alias: "Metric A",
                            },
                        },
                        {
                            measure: {
                                localIdentifier: "m2",
                                definition: {
                                    measureDefinition: {
                                        item: { uri: "/gdc/md/mockproject/obj/metric.account" },
                                    },
                                },
                                alias: "Metric B",
                            },
                        },
                    ],
                    attributes: [
                        {
                            attribute: {
                                displayForm: { uri: "/gdc/md/mockproject/obj/attribute.fruit.df" },
                                localIdentifier: "a1",
                            },
                        },
                    ],
                },
            } as IDataView,
            drillContext: {
                type: "column",
                element: "bar",
                intersection: [
                    {
                        header: {
                            measureHeaderItem: {
                                identifier: "metric.account",
                                uri: "/gdc/md/mockproject/obj/metric.account",
                                localIdentifier: "m2",
                                format: "#,##0.00",
                                name: "Metric B",
                            },
                        },
                    },
                    {
                        header: {
                            attributeHeaderItem: {
                                uri: "/gdc/md/mockproject/obj/attribute.fruit/elements?id=2",
                                name: "Banana",
                            },
                            attributeHeader: {
                                ref: uriRef("/gdc/md/mockproject/obj/attribute.fruit.df"),
                                identifier: "attribute.fruit.df",
                                uri: "/gdc/md/mockproject/obj/attribute.fruit.df",
                                name: "Juice fruit",
                                localIdentifier: "a1",
                                formOf: {
                                    ref: uriRef("/gdc/md/mockproject/obj/attribute.fruit"),
                                    uri: "/gdc/md/mockproject/obj/attribute.fruit",
                                    identifier: "attribute.fruit",
                                    name: "Juice fruit",
                                },
                                primaryLabel: uriRef("/gdc/md/mockproject/obj/attribute.fruit.df"),
                            },
                        },
                    },
                ],
                x: 1,
                y: 563,
            },
        };
        const action = createDrillPerformedAction(drillEvent);

        it("should call postEvent when in embedding", () => {
            return expectSaga(drillPerformed, action)
                .provide([
                    [select(), initialState],
                    [matchers.call.fn(getIsEmbedded), true],
                ])
                .call(getIsEmbedded, initialState)
                .call(drillPerformedEvent, drillEvent)
                .run();
        });

        it("should not call postEvent when is not in embedding", () => {
            return expectSaga(drillPerformed, action)
                .provide([
                    [select(), initialState],
                    [matchers.call.fn(getIsEmbedded), false],
                ])
                .call(getIsEmbedded, initialState)
                .not.call(drillPerformedEvent, drillEvent)
                .run();
        });
    });
});
