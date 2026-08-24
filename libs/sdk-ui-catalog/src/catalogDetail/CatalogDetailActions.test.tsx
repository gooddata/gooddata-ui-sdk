// (C) 2026 GoodData Corporation

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { type Mock, describe, expect, it, vi } from "vitest";

import {
    type IAnalyticalBackend,
    type IUserWorkspaceSettings,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import type {
    ICatalogItemDashboard,
    ICatalogItemInsight,
    ICatalogItemParameter,
} from "../catalogItem/types.js";
import { InsightCodecProvider } from "../insight/insightCodecContext.js";
import { TestIntlProvider } from "../localization/TestIntlProvider.js";
import { TestPermissionsProvider, defaultPermissionsResult } from "../permission/TestPermissionsProvider.js";

import { CatalogDetailActions } from "./CatalogDetailActions.js";

vi.mock("../asCode/AsCodeEditorBody.js", () => import("../asCode/asCodeEditorBody.test.utils.js"));

const parametersEnabledResult = {
    ...defaultPermissionsResult,
    settings: { enableParameters: true } as IUserWorkspaceSettings,
};

const stubBackend = {} as unknown as IAnalyticalBackend;

/** A parameter as the backend echoes it back from create/update. */
function savedParameter(id: string, title: string) {
    return {
        type: "parameter",
        ref: idRef(id, "parameter"),
        id,
        title,
        description: "",
        tags: [],
        definition: { type: "NUMBER", defaultValue: 0 },
    };
}

interface IParameterServiceStub {
    backend: IAnalyticalBackend;
    createParameter: Mock;
    updateParameter: Mock;
    deleteParameter: Mock;
}

/**
 * The component resolves its descriptor from the registry, and the descriptor builds the *real*
 * parameter mutation adapter over the backend from context — so the backend is the injection seam
 * and the adapter stays under test. Faking `createParameterMutationAdapter` with `vi.mock` instead
 * would not survive a non-isolated run: other test files load that module unmocked, and a module
 * mock cannot be applied to a module graph they already evaluated.
 */
function createParameterService(overrides: Partial<Omit<IParameterServiceStub, "backend">> = {}) {
    const service: Omit<IParameterServiceStub, "backend"> = {
        createParameter: vi.fn().mockResolvedValue(savedParameter("param.id", "My Param")),
        updateParameter: vi.fn().mockResolvedValue(savedParameter("param.id", "My Param")),
        deleteParameter: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    };

    return {
        ...service,
        backend: {
            workspace: () => ({ parameters: () => service }),
        } as unknown as IAnalyticalBackend,
    };
}

const dashboardItem: ICatalogItemDashboard = {
    identifier: "dash.id",
    type: "analyticalDashboard",
    title: "My Dashboard",
    description: "",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
};

const parameterItem: ICatalogItemParameter = {
    identifier: "param.id",
    type: "parameter",
    title: "My Param",
    description: "",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    definition: { type: "NUMBER", defaultValue: 0 },
};

/**
 * Settles the dialog's lazily-loaded editor half and returns its textarea.
 *
 * The dialog `lazy()`-loads the editor body, so the first open commits a Suspense fallback. React
 * then throttles the retry commit by ~300ms so that fallback cannot flash — and RTL's `findBy*`
 * simply waits that out, because it deliberately drops out of `act()` while polling. Awaiting the
 * very module the `lazy()` awaits, from inside `act()`, lets React flush the retry right away
 * instead: it costs one module resolution (already cached after the first call) rather than the
 * throttle window.
 */
async function findYamlEditor() {
    await act(async () => {
        await import("../asCode/AsCodeEditorBody.js");
    });
    return screen.getByTestId("yaml-editor") as HTMLTextAreaElement;
}

function createWrapper(backend: IAnalyticalBackend = createParameterService().backend) {
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <TestIntlProvider>
                <BackendProvider backend={backend}>
                    <WorkspaceProvider workspace="test-workspace">
                        <ToastsCenterContextProvider>
                            <TestPermissionsProvider result={parametersEnabledResult}>
                                {children}
                            </TestPermissionsProvider>
                        </ToastsCenterContextProvider>
                    </WorkspaceProvider>
                </BackendProvider>
            </TestIntlProvider>
        );
    }
    return Wrapper;
}

const visualizationEnabledResult = {
    ...defaultPermissionsResult,
    settings: { enableAnalyticalCatalogVisualizationEditor: true } as IUserWorkspaceSettings,
};

const insightItem = (visualizationType: ICatalogItemInsight["visualizationType"]): ICatalogItemInsight => ({
    identifier: "viz.id",
    type: "insight",
    title: "My Visualization",
    description: "",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    visualizationType,
});

// Only "bar" is codec-representable here, so a "combo" item exercises the unsupported path.
function createVisualizationWrapper() {
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <TestIntlProvider>
                <BackendProvider backend={stubBackend}>
                    <WorkspaceProvider workspace="test-workspace">
                        <ToastsCenterContextProvider>
                            <TestPermissionsProvider result={visualizationEnabledResult}>
                                <InsightCodecProvider
                                    requestLoad={vi.fn(async () => {})}
                                    isVisualizationTypeEditable={(type) => type === "bar"}
                                >
                                    {children}
                                </InsightCodecProvider>
                            </TestPermissionsProvider>
                        </ToastsCenterContextProvider>
                    </WorkspaceProvider>
                </BackendProvider>
            </TestIntlProvider>
        );
    }
    return Wrapper;
}

// No InsightCodecProvider — a host that did not inject the codec, so editing falls back to AD.
function createNoCodecHostWrapper() {
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <TestIntlProvider>
                <BackendProvider backend={stubBackend}>
                    <WorkspaceProvider workspace="test-workspace">
                        <ToastsCenterContextProvider>
                            <TestPermissionsProvider result={visualizationEnabledResult}>
                                {children}
                            </TestPermissionsProvider>
                        </ToastsCenterContextProvider>
                    </WorkspaceProvider>
                </BackendProvider>
            </TestIntlProvider>
        );
    }
    return Wrapper;
}

describe("CatalogDetailActions", () => {
    describe("parameter edit flow", () => {
        it("opens the edit dialog on Edit click, persists the update, and fires onCatalogItemUpdate", async () => {
            const service = createParameterService({
                updateParameter: vi.fn().mockResolvedValue(savedParameter("param.id", "Renamed Param")),
            });
            const onCatalogItemUpdate = vi.fn();

            render(
                <CatalogDetailActions
                    item={parameterItem}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={onCatalogItemUpdate}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createWrapper(service.backend) },
            );

            fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));

            const editor = await findYamlEditor();
            fireEvent.change(editor, {
                target: {
                    value: `id: param.id
title: Renamed Param
description: ""
tags: []
definition:
  type: NUMBER
  defaultValue: 10`,
                },
            });
            fireEvent.click(screen.getByText("Save", { selector: "button span, button" }));

            await waitFor(() => {
                // The identity is pinned to the item the editor started from, not to the edited YAML.
                expect(service.updateParameter).toHaveBeenCalledWith(
                    expect.objectContaining({
                        identifier: "param.id",
                        title: "Renamed Param",
                        definition: { type: "NUMBER", defaultValue: 10 },
                    }),
                );
            });
            await waitFor(() => {
                expect(onCatalogItemUpdate).toHaveBeenCalledWith(
                    expect.objectContaining({ identifier: "param.id", title: "Renamed Param" }),
                );
            });
        });
    });

    describe("parameter delete flow", () => {
        it("opens delete confirmation; confirming deletes the parameter and fires onCatalogItemDelete with the item ref", async () => {
            const service = createParameterService();
            const onCatalogItemDelete = vi.fn();

            render(
                <CatalogDetailActions
                    item={parameterItem}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={onCatalogItemDelete}
                />,
                { wrapper: createWrapper(service.backend) },
            );

            fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
            fireEvent.click(screen.getByText("Delete"));

            const confirmButton = await screen.findByText("Delete", {
                selector: "button span, button",
            });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(service.deleteParameter).toHaveBeenCalledWith(
                    expect.objectContaining({
                        identifier: "param.id",
                        type: "parameter",
                    }),
                );
            });
            await waitFor(() => {
                expect(onCatalogItemDelete).toHaveBeenCalledWith(
                    expect.objectContaining({
                        identifier: "param.id",
                        type: "parameter",
                    }),
                );
            });
        });
    });

    describe("parameter duplicate flow", () => {
        it("opens a create dialog seeded from the source item; Create persists the copy and fires onCatalogItemCreate", async () => {
            const service = createParameterService({
                createParameter: vi.fn().mockResolvedValue(savedParameter("my_param__2_", "My Param (2)")),
            });
            const onCatalogItemCreate = vi.fn();

            render(
                <CatalogDetailActions
                    item={parameterItem}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={onCatalogItemCreate}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createWrapper(service.backend) },
            );

            fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
            fireEvent.click(screen.getByText("Save as new"));

            const editor = await findYamlEditor();
            expect(editor.value).toContain("title: My Param (2)");
            expect(editor.value).toContain("id: my_param__2_");

            fireEvent.click(screen.getByText("Create", { selector: "button span, button" }));

            await waitFor(() => {
                expect(service.createParameter).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: "my_param__2_",
                        title: "My Param (2)",
                    }),
                );
            });
            await waitFor(() => {
                expect(onCatalogItemCreate).toHaveBeenCalledWith(
                    expect.objectContaining({ identifier: "my_param__2_", title: "My Param (2)" }),
                );
            });
        });
    });

    describe("parameter duplicate collision handling", () => {
        it("retries create without id when the auto-generated copy id collides", async () => {
            const createParameter = vi
                .fn()
                .mockRejectedValueOnce(new UnexpectedResponseError("Duplicate id", 409, {}))
                .mockResolvedValueOnce(savedParameter("my_param__2_", "My Param (2)"));
            const service = createParameterService({ createParameter });

            render(
                <CatalogDetailActions
                    item={parameterItem}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createWrapper(service.backend) },
            );

            fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
            fireEvent.click(screen.getByText("Save as new"));

            await findYamlEditor();
            fireEvent.click(screen.getByText("Create", { selector: "button span, button" }));

            await waitFor(() => {
                expect(createParameter).toHaveBeenCalledTimes(2);
            });
            expect(createParameter).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({ id: "my_param__2_" }),
            );
            const secondCallArg = createParameter.mock.calls[1][0] as { id?: unknown };
            expect(secondCallArg.id).toBeUndefined();
        });

        it("does not retry when a user-edited id collides", async () => {
            const createParameter = vi
                .fn()
                .mockRejectedValue(new UnexpectedResponseError("Duplicate id", 409, {}));
            const service = createParameterService({ createParameter });

            render(
                <CatalogDetailActions
                    item={parameterItem}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createWrapper(service.backend) },
            );

            fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
            fireEvent.click(screen.getByText("Save as new"));

            const editor = await findYamlEditor();
            fireEvent.change(editor, {
                target: { value: editor.value.replace("id: my_param__2_", "id: custom_id") },
            });
            fireEvent.click(screen.getByText("Create", { selector: "button span, button" }));

            await waitFor(() => {
                expect(createParameter).toHaveBeenCalledTimes(1);
            });
            expect(screen.getByText("Create parameter")).toBeInTheDocument();
        });
    });

    describe("parameter edit-to-duplicate handoff", () => {
        it("passes unsaved YAML edits from the edit dialog into the duplicate dialog", async () => {
            render(
                <CatalogDetailActions
                    item={parameterItem}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createWrapper() },
            );

            fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));

            const editor = await findYamlEditor();
            fireEvent.change(editor, {
                target: {
                    value: `id: param.id
title: Edited Title
description: ""
tags: []
definition:
  type: NUMBER
  defaultValue: 15`,
                },
            });
            fireEvent.click(screen.getByText("Save as new"));

            await screen.findByText("Create parameter");
            const duplicateEditor = screen.getByTestId("yaml-editor") as HTMLTextAreaElement;
            expect(duplicateEditor.value).toContain("title: Edited Title (2)");
        });
    });

    describe("parameter items with edit permission", () => {
        it("renders an Edit button and an overflow menu with Duplicate and Delete", () => {
            render(
                <CatalogDetailActions
                    item={parameterItem}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createWrapper() },
            );

            expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();

            fireEvent.click(screen.getByRole("button", { name: /actions for/i }));

            expect(screen.getByText("Save as new")).toBeInTheDocument();
            expect(screen.getByText("Delete")).toBeInTheDocument();
        });
    });

    describe("parameter items without edit permission", () => {
        it("renders no action buttons", () => {
            render(
                <CatalogDetailActions
                    item={parameterItem}
                    canEdit={false}
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createWrapper() },
            );

            expect(screen.queryByRole("button")).not.toBeInTheDocument();
            expect(screen.queryByRole("link")).not.toBeInTheDocument();
        });
    });

    describe("visualization items", () => {
        it("offers inline Edit and Duplicate for a visualization whose type the codec can represent", () => {
            render(
                <CatalogDetailActions
                    item={insightItem("bar")}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createVisualizationWrapper() },
            );

            expect(screen.getByRole("button", { name: /^edit$/i })).toBeInTheDocument();
            fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
            expect(screen.getByText("Duplicate")).toBeInTheDocument();
            expect(screen.getByText("Delete")).toBeInTheDocument();
        });

        it("withholds Edit and Duplicate but keeps Delete and the Analytical Designer action for a type the codec cannot represent", () => {
            render(
                <CatalogDetailActions
                    item={insightItem("combo")}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createVisualizationWrapper() },
            );

            // Edit/Duplicate need the codec (withheld); Delete and Open remain.
            expect(screen.queryByRole("button", { name: /^edit$/i })).not.toBeInTheDocument();
            fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
            expect(screen.getByText("Open in Analytical Designer")).toBeInTheDocument();
            expect(screen.getByText("Delete")).toBeInTheDocument();
            expect(screen.queryByText("Duplicate")).not.toBeInTheDocument();
        });

        it("withholds Edit and Duplicate when no codec host is present, keeping Delete and the Analytical Designer action", () => {
            render(
                <CatalogDetailActions
                    item={insightItem("bar")}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createNoCodecHostWrapper() },
            );

            // Even a representable chart type needs a host-injected codec to edit inline.
            expect(screen.queryByRole("button", { name: /^edit$/i })).not.toBeInTheDocument();
            fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
            expect(screen.getByText("Open in Analytical Designer")).toBeInTheDocument();
            expect(screen.getByText("Delete")).toBeInTheDocument();
            expect(screen.queryByText("Duplicate")).not.toBeInTheDocument();
        });
    });

    describe("non-parameter items", () => {
        it("renders an Open button that invokes onOpen with the item", () => {
            const onOpen = vi.fn();
            render(
                <CatalogDetailActions
                    item={dashboardItem}
                    canEdit
                    onOpen={onOpen}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createWrapper() },
            );

            const openButton = screen.getByRole("link", { name: /open/i });
            fireEvent.click(openButton);

            expect(onOpen).toHaveBeenCalledTimes(1);
            expect(onOpen).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    item: dashboardItem,
                    workspaceId: "test-workspace",
                }),
            );
        });
    });
});
