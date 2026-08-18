// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { type IGenAIContextObject, type StoreContext } from "../../types.js";
import { addContextReference } from "../addContextReference.js";
import { collectContextReferences } from "../collectContextReferences.js";
import { removeContextReference } from "../removeContextReference.js";

function foreignDashboard(id: string, title: string): IGenAIContextObject {
    return {
        id,
        ref: idRef(id, "analyticalDashboard"),
        title,
        type: "dashboard",
        where: "referencedObjects",
        nesting: 1,
    };
}

const ambientWidget: IGenAIContextObject = {
    id: "sales-by-region",
    ref: idRef("sales-by-region", "insight"),
    title: "Sales by Region",
    type: "widget",
    where: "referencedObjects",
    nesting: 1,
    context: {
        ref: idRef("revenue", "analyticalDashboard"),
        title: "Revenue",
        type: "DASHBOARD",
    },
};

const ambientContext: StoreContext = {
    ambient: {
        view: {
            dashboard: { ref: idRef("revenue", "analyticalDashboard"), title: "Revenue", widgets: [] },
        },
    },
    active: {
        view: {
            dashboard: { ref: idRef("revenue", "analyticalDashboard"), title: "Revenue", widgets: [] },
        },
    },
};

describe("adding a dashboard the user is not viewing", () => {
    it("lands in referencedObjects as a DASHBOARD with no scoping context", () => {
        const result = addContextReference(ambientContext, foreignDashboard("marketing", "Marketing"));

        expect(result.active?.referencedObjects).toEqual([
            {
                objects: [
                    { ref: idRef("marketing", "analyticalDashboard"), title: "Marketing", type: "DASHBOARD" },
                ],
            },
        ]);
    });

    it("leaves the dashboard the user is viewing in place", () => {
        const result = addContextReference(ambientContext, foreignDashboard("marketing", "Marketing"));

        expect(result.active?.view?.dashboard?.ref).toEqual(idRef("revenue", "analyticalDashboard"));
        expect(result.ambient).toBe(ambientContext.ambient);
    });

    it("collects several added dashboards into one unscoped group", () => {
        const withMarketing = addContextReference(ambientContext, foreignDashboard("marketing", "Marketing"));
        const withBoth = addContextReference(withMarketing, foreignDashboard("finance", "Finance"));

        expect(withBoth.active?.referencedObjects).toHaveLength(1);
        expect(withBoth.active?.referencedObjects?.[0].objects.map((object) => object.title)).toEqual([
            "Marketing",
            "Finance",
        ]);
    });

    it("keeps objects pinned from the viewed dashboard in their own group", () => {
        const withWidget = addContextReference(ambientContext, ambientWidget);
        const withBoth = addContextReference(withWidget, foreignDashboard("marketing", "Marketing"));

        expect(withBoth.active?.referencedObjects).toHaveLength(2);
        expect(withBoth.active?.referencedObjects?.[0].context?.ref).toEqual(
            idRef("revenue", "analyticalDashboard"),
        );
        expect(withBoth.active?.referencedObjects?.[1].context).toBeUndefined();
    });

    it("shows up in the context indicator alongside everything else", () => {
        const withWidget = addContextReference(ambientContext, ambientWidget);
        const withBoth = addContextReference(withWidget, foreignDashboard("marketing", "Marketing"));

        expect(collectContextReferences(withBoth.active).map((reference) => reference.title)).toEqual([
            "Revenue",
            "Sales by Region",
            "Marketing",
        ]);
    });

    it("can be removed on its own without touching the rest of the context", () => {
        const withWidget = addContextReference(ambientContext, ambientWidget);
        const withBoth = addContextReference(withWidget, foreignDashboard("marketing", "Marketing"));

        const active = removeContextReference(withBoth.active, foreignDashboard("marketing", "Marketing"));

        expect(collectContextReferences(active).map((reference) => reference.title)).toEqual([
            "Revenue",
            "Sales by Region",
        ]);
    });

    it("removes only the one asked for when several are added", () => {
        const withMarketing = addContextReference(ambientContext, foreignDashboard("marketing", "Marketing"));
        const withBoth = addContextReference(withMarketing, foreignDashboard("finance", "Finance"));

        const active = removeContextReference(withBoth.active, foreignDashboard("marketing", "Marketing"));

        expect(collectContextReferences(active).map((reference) => reference.title)).toEqual([
            "Revenue",
            "Finance",
        ]);
    });
});
