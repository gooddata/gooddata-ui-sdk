// (C) 2020-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { put } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { type IAttributeSortItem, type IMeasureSortItem } from "@gooddata/sdk-model";
import { type IVisualizationProperties } from "@gooddata/sdk-ui-ext/internal";

import { showWarningMessage } from "../actions/messages_actions.js";
import {
    logVisPropertiesTooLong,
    storeVisualizationProperties,
    visualizationPropertiesChanged,
} from "../actions/properties_actions.js";
import { disableRedo, undo } from "../actions/time_travel_actions.js";
import { initialState } from "../reducers/initial_state.js";
import { visualizationPropertiesChanged as visualizationPropertiesChangedEvent } from "../store/properties/properties_operation_events.js";
import { watchPropertiesOperations } from "../store/properties/properties_operations_saga.js";
import { type IPropertiesState } from "../store/properties/properties_state.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type IStoredVisualizationProperties } from "../typings/properties.js";

import { tooLongProperties } from "./properties_saga_mock.js";
import { onPropertiesChanged } from "./properties_sagas.js";

describe("onPropertiesChanged", () => {
    it("should change metric in visualization properties and send it to reducer", async () => {
        const sortItem: IMeasureSortItem = {
            measureSortItem: {
                direction: "asc",
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: "m1",
                        },
                    },
                ],
            },
        };
        const properties = {
            sortItems: [sortItem],
        };
        const action = visualizationPropertiesChanged(properties, false);

        const { effects } = await expectSaga(onPropertiesChanged, action)
            .withState(initialState)
            .silentRun(0);

        expect(effects.put).toEqual([put(storeVisualizationProperties(properties, properties))]);
    });

    it("should change attribute in visualization properties and send it to reducer", async () => {
        const sortItem: IAttributeSortItem = {
            attributeSortItem: {
                direction: "desc",
                attributeIdentifier: "a1",
            },
        };
        const properties = {
            sortItems: [sortItem],
        };
        const action = visualizationPropertiesChanged(properties, false);

        const { effects } = await expectSaga(onPropertiesChanged, action)
            .withState(initialState)
            .silentRun(0);

        expect(effects.put).toEqual([put(storeVisualizationProperties(properties, properties))]);
    });

    it("should replace control items in current properties with new properties", async () => {
        const properties = {
            controls: { foo: "bar" },
        };

        const expectedMergedProperties: IVisualizationProperties = {
            controls: { foo: "bar" },
            sortItems: [],
        };

        const action = visualizationPropertiesChanged(properties, false);

        const { effects } = await expectSaga(onPropertiesChanged, action)
            .withState(initialState)
            .silentRun(0);

        expect(effects.put).toEqual([
            put(storeVisualizationProperties(properties, expectedMergedProperties)),
        ]);
    });

    it("should merge properties in reference point and set new into visualization properties", async () => {
        const currentProperties = {
            sortItems: [
                {
                    attributeSortItem: {
                        direction: "desc",
                        attributeIdentifier: "a1",
                    },
                },
            ],
        };
        const currentMergedProperties = { new: "properties" };

        const newProperties: IVisualizationProperties = {
            controls: { foo: "bar", prop: null },
            sortItems: [
                {
                    attributeSortItem: {
                        attributeIdentifier: "a1",
                        direction: "desc",
                    },
                },
            ],
        };

        const expectedProperties: IVisualizationProperties = {
            sortItems: [
                {
                    attributeSortItem: {
                        direction: "desc",
                        attributeIdentifier: "a1",
                    },
                },
            ],
            controls: { foo: "bar" },
        };

        const expectedMergedProperties = {
            ...expectedProperties,
            ...currentMergedProperties,
        };

        const action = visualizationPropertiesChanged(newProperties, false);

        const stateWithProperties = withData(initialState, {
            extendedReferencePoint: {
                ...initialState.data.extendedReferencePoint,
                properties: currentProperties as unknown as IStoredVisualizationProperties,
            },
            visualizationProperties: currentMergedProperties as unknown as IPropertiesState,
        });

        const { effects } = await expectSaga(onPropertiesChanged, action)
            .withState(stateWithProperties)
            .silentRun(0);

        expect(effects.put).toEqual([
            put(storeVisualizationProperties(expectedProperties, expectedMergedProperties)),
        ]);
    });

    /**
     * THE TOO-LONG TAIL MOVED: this handler only puts the store trigger now, and the
     * warn/log/undo/disableRedo sequence runs in the OPERATION saga after its event — an undo put
     * from here would land before the queued operation and be silently overwritten by its commit.
     * The ordering itself is pinned end-to-end in reducers/test/properties_characterization.test.ts.
     */
    it("should put only the store action when properties are too long (the revert is the operation's)", async () => {
        const properties = tooLongProperties;

        const expectedMergedProperties: IVisualizationProperties = {
            ...properties,
            sortItems: [],
        };

        const action = visualizationPropertiesChanged(properties, false);

        const { effects } = await expectSaga(onPropertiesChanged, action)
            .withState(initialState)
            .silentRun(0);

        expect(effects.put).toEqual([
            put(storeVisualizationProperties(properties, expectedMergedProperties)),
        ]);
    });
});

describe("handleStoreVisualizationProperties (the operation saga)", () => {
    it("commits the event and THEN warns, logs, reverts and disables redo for an over-long push", async () => {
        const properties = tooLongProperties;
        const action = storeVisualizationProperties(properties, { ...properties, sortItems: [] });

        const { effects } = await expectSaga(watchPropertiesOperations)
            .withState(initialState)
            .dispatch(action)
            .silentRun(0);

        const putActions = effects.put.map((effect) => effect.payload.action);
        expect(putActions.map((dispatched: { type: string }) => dispatched.type)).toEqual([
            visualizationPropertiesChangedEvent.type,
            showWarningMessage("messages.propertiesTooLong").type,
            logVisPropertiesTooLong(298022).type,
            undo().type,
            disableRedo().type,
        ]);
        expect(putActions[2]).toEqual(logVisPropertiesTooLong(298022));
    });

    it("commits the event alone for a push under the cap", async () => {
        const properties: IVisualizationProperties = { controls: { foo: "bar" } };
        const action = storeVisualizationProperties(properties, properties);

        const { effects } = await expectSaga(watchPropertiesOperations)
            .withState(initialState)
            .dispatch(action)
            .silentRun(0);

        expect(effects.put).toHaveLength(1);
        expect(effects.put[0].payload.action.type).toEqual(visualizationPropertiesChangedEvent.type);
    });
});
