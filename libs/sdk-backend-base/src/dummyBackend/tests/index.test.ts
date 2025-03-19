// (C) 2021-2024 GoodData Corporation
import { describe, it, expect } from "vitest";
import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";

import { dummyBackend } from "../index.js";
import { idRef } from "@gooddata/sdk-model";

describe("dummyBackend", () => {
    describe("workspace", () => {
        const WORKSPACE_ID = "workspaceId";

        describe("descriptor", () => {
            it("should return default filled workspace descriptor", async () => {
                const descriptor = await dummyBackend().workspace(WORKSPACE_ID).getDescriptor();

                expect(descriptor).toEqual({
                    id: WORKSPACE_ID,
                    title: "Title",
                    description: "Description",
                    isDemo: false,
                } as IWorkspaceDescriptor);
            });
        });

        describe("measures", () => {
            it("should return created measure", async () => {
                const service = dummyBackend().workspace(WORKSPACE_ID).measures();

                expect(
                    await service.createMeasure({
                        title: "Measure 1",
                        description: "Test",
                        type: "measure",
                        expression: "",
                        format: "",
                    }),
                ).toEqual({
                    deprecated: false,
                    description: "Test",
                    expression: "",
                    format: "",
                    id: "test_metric_id",
                    isLocked: false,
                    production: false,
                    ref: { identifier: "test_metric_id", type: "measure" },
                    title: "Measure 1",
                    type: "measure",
                    unlisted: false,
                    uri: "test_metric_id",
                });
            });

            it("should return updated measure", async () => {
                const service = dummyBackend().workspace(WORKSPACE_ID).measures();

                expect(
                    await service.updateMeasure({
                        id: "test",
                        ref: idRef("", "measure"),
                        uri: "",
                        title: "Measure 1",
                        description: "Test",
                        type: "measure",
                        expression: "",
                        format: "",
                        deprecated: false,
                        isLocked: false,
                        production: false,
                        unlisted: false,
                    }),
                ).toEqual({
                    deprecated: false,
                    description: "Test",
                    expression: "",
                    format: "",
                    id: "test",
                    isLocked: false,
                    production: false,
                    ref: { identifier: "", type: "measure" },
                    title: "Measure 1",
                    type: "measure",
                    unlisted: false,
                    uri: "",
                });
            });

            it("should return delete state", async () => {
                const service = dummyBackend().workspace(WORKSPACE_ID).measures();
                // this is implicitly a not.toThrow assertion, no need for explicit expect calls
                await service.deleteMeasure(idRef("", "measure"));
            });

            it("should return expression tokens", async () => {
                const service = dummyBackend().workspace(WORKSPACE_ID).measures();

                expect(await service.getMeasureExpressionTokens(idRef("", "measure"))).toEqual([]);
            });

            it("should return referencing empty object", async () => {
                const service = dummyBackend().workspace(WORKSPACE_ID).measures();

                expect(await service.getMeasureReferencingObjects(idRef("", "measure"))).toEqual({});
            });
        });
    });
});
