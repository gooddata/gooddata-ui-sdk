// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";

import type { StoreContext } from "../types.js";

import { addContextReference } from "./addContextReference.js";
import { selectContextReferences, updateAmbientContext } from "./selectContextReferences.js";

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
