// (C) 2019-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { call, put } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { type IVisualizationClass } from "@gooddata/sdk-model";

import { setVisualizationClasses } from "../actions/visualization_class_actions.js";
import { loadVisualizationClasses as apiLoadVisualizationClasses } from "../utils/api.js";

import { loadVisualizationClasses } from "./visualization_class_sagas.js";

describe("VisualizationClass sagas", () => {
    describe("loadVisualizationClasses", () => {
        it("should load & store visualizationClasses", async () => {
            const projectId = "projectId";
            const visualizationClasses: ReadonlyArray<IVisualizationClass> = [
                {
                    visualizationClass: {
                        checksum: "local",
                        icon: "local:table",
                        iconSelected: "local:table.selected",
                        orderIndex: 0.0,
                        url: "local:table",
                        identifier: "id_table",
                        uri: "/gdc/md/mockproject/obj/table",
                        title: "Table",
                    },
                },
                {
                    visualizationClass: {
                        checksum: "local",
                        icon: "local:column",
                        iconSelected: "local:column.selected",
                        orderIndex: 1.0,
                        identifier: "id_column",
                        uri: "/gdc/md/mockproject/obj/column",
                        url: "local:column",
                        title: "Column chart",
                    },
                },
            ];

            const { effects } = await expectSaga(loadVisualizationClasses, projectId)
                .provide([[call(apiLoadVisualizationClasses, projectId), visualizationClasses]])
                .silentRun(0);

            expect(effects.put).toEqual([put(setVisualizationClasses(visualizationClasses))]);
        });
    });
});
