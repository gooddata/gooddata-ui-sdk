// (C) 2021 GoodData Corporation

import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";

import { dummyBackend } from "../index";

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
    });
});
