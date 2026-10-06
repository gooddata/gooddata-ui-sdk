// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IGenAIUserContext, type IReportDefinition, idRef, uriRef } from "@gooddata/sdk-model";

import type { IGenAIContextObject, StoreContext } from "../types.js";

import { addContextReference } from "./addContextReference.js";
import {
    pickSelectedContextFromUserContext,
    selectContextReferences,
    updateAmbientContext,
} from "./selectContextReferences.js";

describe("updateAmbientContext", () => {
    it("should handle undefined ambient context", () => {
        const context: StoreContext = { loaded: true };
        const result = updateAmbientContext(context, undefined);
        expect(result.ambient).toBeUndefined();
        expect(result.loaded).toBe(true);
    });

    it("should remove old ambient selected dashboard and visualization from active context", () => {
        const oldRef = idRef("old-dash");
        const oldDashboard = { id: "old-dash", ref: oldRef, where: "view.dashboard" } as any;
        const oldVisualization = { id: "old-vis", ref: idRef("old-vis"), where: "referencedObjects" } as any;
        const context: StoreContext = {
            ambient: {
                view: {
                    dashboard: { ref: oldRef, title: "Old Dash" },
                },
            } as any,
            active: {
                view: {
                    dashboard: { ref: oldRef, title: "Old Dash" },
                },
                referencedObjects: [
                    {
                        context: oldDashboard,
                        objects: [oldVisualization],
                    },
                ],
            } as any,
            ambientSelected: {
                dashboard: oldDashboard,
                visualization: oldVisualization,
            },
        };

        const result = updateAmbientContext(context, undefined);

        expect(result.active?.view?.dashboard).toBeUndefined();
        expect(result.active?.referencedObjects?.length).toBeUndefined();
    });

    it("should add new dashboard reference to active context if present in ambient context", () => {
        const context: StoreContext = { loaded: false };
        const ambient = {
            view: {
                dashboard: {
                    ref: idRef("new-dash"),
                    title: "New Dashboard",
                },
            },
        } as any;

        const result = updateAmbientContext(context, ambient);

        expect(result.active?.view?.dashboard?.ref).toEqual(idRef("new-dash"));
        expect(result.loaded).toBe(true);
        expect(result.ambientSelected?.dashboard?.id).toBe("new-dash");
        expect(result.ambientSelected?.activated).toBe(true); // because context.loaded was false
    });

    it("should handle uriRef for dashboard id", () => {
        const context: StoreContext = { loaded: true };
        const ambient = {
            view: {
                dashboard: {
                    ref: uriRef("new-dash-uri"),
                    title: "New Dashboard",
                },
            },
        } as any;

        const result = updateAmbientContext(context, ambient);

        expect(result.ambientSelected?.dashboard?.id).toBe("new-dash-uri");
    });

    it("should clear visualization if dashboard reference changed", () => {
        const context: StoreContext = {
            loaded: true,
            ambient: {
                view: {
                    dashboard: { ref: idRef("old-dash") },
                },
            } as any,
            ambientSelected: {
                dashboard: { id: "old-dash", ref: idRef("old-dash") } as any,
                visualization: { id: "vis" } as any,
            },
        };
        const ambient = {
            view: {
                dashboard: {
                    ref: idRef("new-dash"),
                    title: "New Dashboard",
                },
            },
        } as any;

        const result = updateAmbientContext(context, ambient);

        expect(result.ambientSelected?.visualization).toBeUndefined();
    });

    it("should NOT clear visualization if dashboard reference NOT changed", () => {
        const context: StoreContext = {
            loaded: true,
            ambient: {
                view: {
                    dashboard: { ref: idRef("same-dash") },
                },
            } as any,
            ambientSelected: {
                dashboard: { id: "same-dash", ref: idRef("same-dash") } as any,
                visualization: { id: "vis" } as any,
            },
        };
        const ambient = {
            view: {
                dashboard: {
                    ref: idRef("same-dash"),
                    title: "Same Dashboard",
                },
            },
        } as any;

        const result = updateAmbientContext(context, ambient);

        expect(result.ambientSelected?.visualization).toEqual({ id: "vis" });
    });

    it("should NOT set activated to true if already loaded", () => {
        const context: StoreContext = { loaded: true };
        const ambient = {
            view: {
                dashboard: {
                    ref: idRef("new-dash"),
                    title: "New Dashboard",
                },
            },
        } as any;

        const result = updateAmbientContext(context, ambient);

        expect(result.ambientSelected?.activated).toBeUndefined();
    });

    it("should NOT add dashboard reference to active context if already loaded and NOT activated", () => {
        const context: StoreContext = { loaded: true, ambientSelected: { activated: false } };
        const ambient = {
            view: {
                dashboard: {
                    ref: idRef("new-dash"),
                    title: "New Dashboard",
                },
            },
        } as any;

        const result = updateAmbientContext(context, ambient);

        expect(result.active?.view?.dashboard).toBeUndefined();
        expect(result.ambientSelected?.dashboard?.id).toBe("new-dash");
        expect(result.ambientSelected?.activated).toBe(false);
    });

    it("should add dashboard reference to active context if already loaded and already activated", () => {
        const context: StoreContext = { loaded: true, ambientSelected: { activated: true } };
        const ambient = {
            view: {
                dashboard: {
                    ref: idRef("new-dash"),
                    title: "New Dashboard",
                },
            },
        } as any;

        const result = updateAmbientContext(context, ambient);

        expect(result.active?.view?.dashboard?.ref).toEqual(idRef("new-dash"));
        expect(result.ambientSelected?.dashboard?.id).toBe("new-dash");
        expect(result.ambientSelected?.activated).toBe(true);
    });

    it("should NOT add dashboard reference to active context if already loaded and activated is undefined", () => {
        const context: StoreContext = { loaded: true };
        const ambient = {
            view: {
                dashboard: {
                    ref: idRef("new-dash"),
                    title: "New Dashboard",
                },
            },
        } as any;

        const result = updateAmbientContext(context, ambient);

        expect(result.active?.view?.dashboard).toBeUndefined();
        expect(result.ambientSelected?.dashboard?.id).toBe("new-dash");
        expect(result.ambientSelected?.activated).toBeUndefined();
    });

    it("should use empty string if dashboard title is missing", () => {
        const context: StoreContext = { loaded: true };
        const ambient = {
            view: {
                dashboard: {
                    ref: idRef("new-dash"),
                    // title is missing
                },
            },
        } as any;

        const result = updateAmbientContext(context, ambient);

        expect(result.ambientSelected?.dashboard?.title).toBe("");
    });

    it("should handle missing initial ambientSelected", () => {
        const context: StoreContext = { loaded: true };
        const ambient = {
            view: {
                dashboard: {
                    ref: idRef("new-dash"),
                    title: "Dash",
                },
            },
        } as any;

        const result = updateAmbientContext(context, ambient);

        expect(result.ambientSelected?.dashboard?.id).toBe("new-dash");
    });

    it("should keep visualization in active context if dashboard reference NOT changed and already activated", () => {
        const dashRef = idRef("same-dash");
        const visRef = idRef("vis");
        const dashboard = {
            id: "same-dash",
            ref: dashRef,
            type: "dashboard",
            where: "view.dashboard",
        } as any;
        const visualization = {
            id: "vis",
            ref: visRef,
            type: "visualization",
            where: "referencedObjects",
        } as any;

        const context: StoreContext = {
            loaded: true,
            ambient: {
                view: {
                    dashboard: { ref: dashRef, title: "Same Dashboard" },
                },
            } as any,
            active: {
                view: {
                    dashboard: { ref: dashRef, title: "Same Dashboard" },
                },
                referencedObjects: [
                    {
                        context: dashboard,
                        objects: [visualization],
                    },
                ],
            } as any,
            ambientSelected: {
                dashboard,
                visualization,
                activated: true,
            },
        };

        const ambient = {
            view: {
                dashboard: {
                    ref: dashRef,
                    title: "Same Dashboard",
                },
            },
        } as any;

        const result = updateAmbientContext(context, ambient);

        expect(result.active?.view?.dashboard?.ref).toEqual(dashRef);
        expect(result.active?.referencedObjects?.[0]?.objects).toHaveLength(1);
        expect(result.active?.referencedObjects?.[0]?.objects?.[0]?.ref).toEqual(visRef);
    });

    it("should update dashboard title in active context when ambient title changes", () => {
        const dashRef = idRef("dash");
        const context: StoreContext = {
            loaded: true,
            ambient: {
                view: {
                    dashboard: { ref: dashRef, title: "Old Title" },
                },
            } as any,
            active: {
                view: {
                    dashboard: { ref: dashRef, title: "Old Title" },
                },
            } as any,
            ambientSelected: {
                dashboard: { id: "dash", ref: dashRef, title: "Old Title", where: "view.dashboard" } as any,
                activated: true,
            },
        };

        const ambient = {
            view: {
                dashboard: {
                    ref: dashRef,
                    title: "New Title",
                },
            },
        } as any;

        const result = updateAmbientContext(context, ambient);

        expect(result.active?.view?.dashboard?.title).toBe("New Title");
        expect(result.ambientSelected?.dashboard?.title).toBe("New Title");
    });
});

describe("pickSelectedContextFromUserContext", () => {
    it("should return same context if userContext is undefined", () => {
        const context: StoreContext = { loaded: true };
        const result = pickSelectedContextFromUserContext(context, undefined);
        expect(result).toBe(context);
    });

    it("should return same context if no matching dashboard group is found", () => {
        const context: StoreContext = {
            ambientSelected: {
                dashboard: { ref: idRef("d1") } as any,
            },
        };
        const userContext: any = {
            referencedObjects: [
                {
                    context: { ref: idRef("d2") },
                    objects: [{ ref: idRef("v1"), title: "V1", type: "INSIGHT" }],
                },
            ],
        };
        const result = pickSelectedContextFromUserContext(context, userContext);
        expect(result).toBe(context);
    });

    it("should pick first object from matching dashboard group", () => {
        const dashRef = idRef("d1");
        const visRef = idRef("v1");
        const context: StoreContext = {
            ambientSelected: {
                dashboard: { ref: dashRef } as any,
            },
        };
        const userContext: any = {
            referencedObjects: [
                {
                    context: { ref: dashRef, title: "D1", type: "DASHBOARD" },
                    objects: [
                        { ref: visRef, title: "V1", type: "INSIGHT" },
                        { ref: idRef("v2"), title: "V2", type: "INSIGHT" },
                    ],
                },
            ],
        };
        const result = pickSelectedContextFromUserContext(context, userContext);

        expect(result.ambientSelected?.visualization).toEqual({
            id: "v1",
            ref: visRef,
            title: "V1",
            nesting: 0,
            context: userContext.referencedObjects[0].context,
            type: "insight",
            where: "referencedObjects",
        });
    });

    it("should handle WIDGET type and map it to widget", () => {
        const dashRef = idRef("d1");
        const visRef = idRef("v1");
        const context: StoreContext = {
            ambientSelected: {
                dashboard: { ref: dashRef } as any,
            },
        };
        const userContext: any = {
            referencedObjects: [
                {
                    context: { ref: dashRef, title: "D1", type: "DASHBOARD" },
                    objects: [{ ref: visRef, title: "V1", type: "WIDGET" }],
                },
            ],
        };
        const result = pickSelectedContextFromUserContext(context, userContext);

        expect(result.ambientSelected?.visualization?.type).toBe("widget");
    });

    it("should handle uriRef for visualization id", () => {
        const dashRef = idRef("d1");
        const visRef = uriRef("v1-uri");
        const context: StoreContext = {
            ambientSelected: {
                dashboard: { ref: dashRef } as any,
            },
        };
        const userContext: any = {
            referencedObjects: [
                {
                    context: { ref: dashRef, title: "D1", type: "DASHBOARD" },
                    objects: [{ ref: visRef, title: "V1", type: "INSIGHT" }],
                },
            ],
        };
        const result = pickSelectedContextFromUserContext(context, userContext);

        expect(result.ambientSelected?.visualization?.id).toBe("v1-uri");
    });
});

describe("selectContextReferences", () => {
    it("should update ambientSelected with provided selected partial", () => {
        const context: StoreContext = {
            ambientSelected: { activated: false },
        };
        const selected = { activated: true };

        const result = selectContextReferences(context, selected);

        expect(result.ambientSelected?.activated).toBe(true);
    });

    it("should add references to active context when activated", () => {
        const dashRef = idRef("d1");
        const dashboard = { id: "d1", ref: dashRef, type: "dashboard", where: "view.dashboard" } as any;
        const context: StoreContext = {
            ambient: {
                view: {
                    dashboard: { ref: dashRef, title: "D1" },
                },
            } as any,
            ambientSelected: {
                dashboard,
                activated: false,
            },
        };

        const result = selectContextReferences(context, { activated: true });

        expect(result.active?.view?.dashboard?.ref).toEqual(dashRef);
    });

    it("should remove references from active context when deactivated", () => {
        const dashRef = idRef("d1");
        const dashboard = { id: "d1", ref: dashRef, type: "dashboard", where: "view.dashboard" } as any;
        const context: StoreContext = {
            ambient: {
                view: {
                    dashboard: { ref: dashRef, title: "D1" },
                },
            } as any,
            active: {
                view: {
                    dashboard: { ref: dashRef, title: "D1" },
                },
            } as any,
            ambientSelected: {
                dashboard,
                activated: true,
            },
        };

        const result = selectContextReferences(context, { activated: false });

        expect(result.active?.view?.dashboard).toBeUndefined();
    });

    it("should add both dashboard and visualization references when activated", () => {
        const dashRef = idRef("d1");
        const visRef = idRef("v1");
        const dashboard = { id: "d1", ref: dashRef, type: "dashboard", where: "view.dashboard" } as any;
        const visualization = {
            id: "v1",
            ref: visRef,
            type: "visualization",
            where: "referencedObjects",
        } as any;
        const context: StoreContext = {
            ambient: {
                view: {
                    dashboard: { ref: dashRef, title: "D1" },
                },
            } as any,
            ambientSelected: {
                dashboard,
                visualization,
                activated: false,
            },
        };

        const result = selectContextReferences(context, { activated: true });

        expect(result.active?.view?.dashboard?.ref).toEqual(dashRef);
        expect(result.active?.referencedObjects?.[0]?.objects?.[0]?.ref).toEqual(visRef);
    });

    it("should remove both dashboard and visualization references when deactivated", () => {
        const dashRef = idRef("d1");
        const visRef = idRef("v1");
        const dashboard = { id: "d1", ref: dashRef, type: "dashboard", where: "view.dashboard" } as any;
        const visualization = {
            id: "v1",
            ref: visRef,
            type: "visualization",
            where: "referencedObjects",
            context: dashboard,
        } as any;

        // Setup state with references added
        let context: StoreContext = {
            ambient: {
                view: {
                    dashboard: { ref: dashRef, title: "D1" },
                },
            } as any,
            ambientSelected: {
                dashboard,
                visualization,
                activated: true,
            },
        };
        context = addContextReference(context, dashboard);
        context = addContextReference(context, visualization);

        const result = selectContextReferences(context, { activated: false });

        expect(result.active?.view?.dashboard).toBeUndefined();
        expect(result.active?.referencedObjects).toBeUndefined();
    });

    it("should not duplicate visualization when selection changes and already activated", () => {
        const dashRef = idRef("d1");
        const visRef = idRef("v1");
        const dashboard = { id: "d1", ref: dashRef, type: "dashboard", where: "view.dashboard" } as any;
        const visualization = {
            id: "v1",
            ref: visRef,
            type: "visualization",
            where: "referencedObjects",
            context: dashboard,
        } as any;

        // Setup state with references added
        let context: StoreContext = {
            ambient: {
                view: {
                    dashboard: { ref: dashRef, title: "D1" },
                },
            } as any,
            ambientSelected: {
                dashboard,
                visualization,
                activated: true,
            },
        };
        context = addContextReference(context, dashboard);
        context = addContextReference(context, visualization);

        // Change visualization to the same one (or another one)
        const result = selectContextReferences(context, { visualization });

        expect(result.active?.referencedObjects?.[0]?.objects).toHaveLength(1);
        expect(result.active?.referencedObjects?.[0]?.objects?.[0]?.ref).toEqual(visRef);
    });
});

describe("updateAmbientContext with a report that is not saved yet", () => {
    const definition = (title: string): IReportDefinition => ({
        type: "report",
        title,
        periodStart: "2026-01-01",
        periodEnd: "2026-03-31",
        content: { version: "1", pages: [] },
    });
    const draftAmbient = (title: string): IGenAIUserContext => ({
        view: { report: { title, definition: definition(title) } },
    });

    it("should select and activate it without a reference", () => {
        const result = updateAmbientContext({}, draftAmbient("Draft"));

        expect(result.ambientSelected).toMatchObject({
            activated: true,
            report: { id: "unsaved", type: "report", where: "view.report", title: "Draft" },
        });
        expect(result.ambientSelected?.report?.ref).toBeUndefined();
        expect(result.active?.view?.report).toEqual(draftAmbient("Draft").view?.report);
    });

    it("should send the latest definition of the same draft", () => {
        const first = updateAmbientContext({}, draftAmbient("Draft"));
        const result = updateAmbientContext(first, draftAmbient("Draft edited"));

        expect(result.active?.view?.report?.definition?.title).toBe("Draft edited");
    });

    it("should send the draft in place of a saved report", () => {
        const saved = updateAmbientContext(
            {},
            { view: { report: { ref: idRef("q1", "report"), title: "Q1", definition: definition("Q1") } } },
        );
        const result = updateAmbientContext(saved, draftAmbient("Draft"));

        expect(result.active?.view?.report?.ref).toBeUndefined();
        expect(result.active?.view?.report?.title).toBe("Draft");
    });
});

describe("updateAmbientContext with a report", () => {
    const reportRef = idRef("q1", "report");
    const definition = (title: string): IReportDefinition => ({
        type: "report",
        title,
        periodStart: "2026-01-01",
        periodEnd: "2026-03-31",
        content: { version: "1", pages: [] },
    });
    const reportAmbient = (title: string): IGenAIUserContext => ({
        view: { report: { ref: reportRef, title, definition: definition(title) } },
    });

    it("should select and activate the report the first time it is reported", () => {
        const result = updateAmbientContext({}, reportAmbient("Q1"));

        expect(result.loaded).toBe(true);
        expect(result.ambientSelected).toMatchObject({
            activated: true,
            report: { id: "q1", ref: reportRef, type: "report", where: "view.report", title: "Q1" },
        });
        expect(result.active?.view?.report).toEqual(reportAmbient("Q1").view?.report);
    });

    it("should send the latest definition of the same report", () => {
        const first = updateAmbientContext({}, reportAmbient("Q1"));
        const result = updateAmbientContext(first, reportAmbient("Q1 draft"));

        expect(result.active?.view?.report?.definition?.title).toBe("Q1 draft");
    });

    it("should keep a report the user switched off out of the context when the draft changes", () => {
        const first = updateAmbientContext({}, reportAmbient("Q1"));
        const switchedOff = selectContextReferences(first, { activated: false });
        const result = updateAmbientContext(switchedOff, reportAmbient("Q1 draft"));

        expect(switchedOff.active?.view?.report).toBeUndefined();
        expect(result.ambientSelected?.activated).toBe(false);
        expect(result.active?.view?.report).toBeUndefined();
        expect(result.ambientSelected?.report?.title).toBe("Q1 draft");
    });

    it("should drop the report once it is no longer reported", () => {
        const first = updateAmbientContext({}, reportAmbient("Q1"));
        const result = updateAmbientContext(first, undefined);

        expect(result.ambientSelected?.report).toBeUndefined();
        expect(result.active).toBeUndefined();
    });

    it("should send the newly opened report in place of the previous one", () => {
        const first = updateAmbientContext({}, reportAmbient("Q1"));
        const nextRef = idRef("q2", "report");
        const result = updateAmbientContext(first, {
            view: { report: { ref: nextRef, title: "Q2", definition: definition("Q2") } },
        });

        expect(result.ambientSelected).toMatchObject({ activated: true, report: { id: "q2", title: "Q2" } });
        expect(result.active?.view).toEqual({
            report: { ref: nextRef, title: "Q2", definition: definition("Q2") },
        });
    });

    it("should keep a report the user switched off out of the context when another report opens", () => {
        const first = updateAmbientContext({}, reportAmbient("Q1"));
        const switchedOff = selectContextReferences(first, { activated: false });
        const result = updateAmbientContext(switchedOff, {
            view: { report: { ref: idRef("q2", "report"), title: "Q2", definition: definition("Q2") } },
        });

        expect(result.ambientSelected).toMatchObject({ activated: false, report: { id: "q2" } });
        expect(result.active).toBeUndefined();
    });

    it("should keep the dashboard visualization when only the report changes", () => {
        const dashboard = { ref: idRef("dashboard-1", "analyticalDashboard"), title: "Sales", widgets: [] };
        const visualization: IGenAIContextObject = {
            id: "widget-1",
            ref: idRef("widget-1", "insight"),
            title: "Revenue",
            nesting: 1,
            type: "widget",
            where: "referencedObjects",
        };
        const first = updateAmbientContext(
            {},
            { view: { dashboard, report: { ref: reportRef, title: "Q1" } } },
        );
        const selected = selectContextReferences(first, { visualization });

        const result = updateAmbientContext(selected, {
            view: { dashboard, report: { ref: idRef("q2", "report"), title: "Q2" } },
        });

        expect(result.ambientSelected?.visualization).toEqual(visualization);
    });

    it("should replace the report with a dashboard reported in its place", () => {
        const dashboardRef = idRef("dashboard-1", "analyticalDashboard");
        const first = updateAmbientContext({}, reportAmbient("Q1"));
        const result = updateAmbientContext(first, {
            view: { dashboard: { ref: dashboardRef, title: "Sales", widgets: [] } },
        });

        expect(result.ambientSelected?.report).toBeUndefined();
        expect(result.ambientSelected?.dashboard?.ref).toEqual(dashboardRef);
        expect(result.active?.view).toEqual({
            dashboard: { ref: dashboardRef, title: "Sales", widgets: [] },
        });
    });
});
