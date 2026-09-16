// (C) 2026 GoodData Corporation

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ActionsApi_ComputeLabelElementsPost } from "@gooddata/api-client-tiger/endpoints/labelElements";
import { idRef, newNegativeAttributeFilter, newPositiveAttributeFilter } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../../types/index.js";

import { type TigerWorkspaceElements as TigerWorkspaceElementsClass } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/labelElements", () => ({
    ActionsApi_ComputeLabelElementsPost: vi.fn().mockResolvedValue({
        data: {
            paging: { total: 0 },
            elements: [],
        },
    }),
}));

const authCall: TigerAuthenticatedCallGuard = async (fn) =>
    fn({ axios: {} } as any, { getPrincipal: () => Promise.resolve({}) } as any);

const lastElementsRequest = () => {
    const calls = vi.mocked(ActionsApi_ComputeLabelElementsPost).mock.calls;
    return calls[calls.length - 1][2].elementsRequest;
};

describe("TigerWorkspaceElementsQuery", () => {
    // The service is imported dynamically from a fresh module registry so that it picks up the mock
    // above even when another (non-isolated) test file already imported it without it.
    let factory: TigerWorkspaceElementsClass;

    beforeAll(async () => {
        vi.resetModules();
        const { TigerWorkspaceElements } = await import("./index.js");
        factory = new TigerWorkspaceElements(authCall, "workspace", (value) => value.toISOString());
    });

    beforeEach(() => {
        vi.mocked(ActionsApi_ComputeLabelElementsPost).mockClear();
    });

    describe("label type", () => {
        it("sends type computedAttribute for a computed attribute ref", async () => {
            await factory.forDisplayForm(idRef("shared_id", "computedAttribute")).query();

            expect(lastElementsRequest()).toMatchObject({ label: "shared_id", type: "computedAttribute" });
        });

        it("omits type for a display form ref", async () => {
            await factory.forDisplayForm(idRef("some_label", "displayForm")).query();

            expect(lastElementsRequest()).not.toHaveProperty("type");
        });

        it("omits type for an untyped ref", async () => {
            await factory.forDisplayForm(idRef("some_label")).query();

            expect(lastElementsRequest()).not.toHaveProperty("type");
        });
    });

    describe("dependsOn type", () => {
        it("sends type of parent filters based on their refs", async () => {
            await factory
                .forDisplayForm(idRef("some_label", "displayForm"))
                .withAttributeFilters([
                    {
                        attributeFilter: newPositiveAttributeFilter(idRef("parent_ca", "computedAttribute"), [
                            "a",
                        ]),
                        overAttribute: idRef("connecting_attr"),
                    },
                    {
                        attributeFilter: newNegativeAttributeFilter(idRef("parent_label", "displayForm"), [
                            "b",
                        ]),
                        overAttribute: idRef("connecting_attr"),
                    },
                    {
                        attributeFilter: newPositiveAttributeFilter(idRef("parent_untyped"), ["c"]),
                        overAttribute: idRef("connecting_attr"),
                    },
                ])
                .query();

            expect(lastElementsRequest().dependsOn).toEqual([
                { label: "parent_ca", type: "computedAttribute", values: ["a"], complementFilter: false },
                { label: "parent_label", values: ["b"], complementFilter: true },
                { label: "parent_untyped", values: ["c"], complementFilter: false },
            ]);
        });
    });
});
