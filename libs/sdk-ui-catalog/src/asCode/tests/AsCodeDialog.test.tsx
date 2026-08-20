// (C) 2026 GoodData Corporation

import { type PropsWithChildren, type ReactNode, createContext, useContext } from "react";

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { getAsCodeDescriptor } from "../../asCodeRegistry.js";
import type { ICatalogItemParameter } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { ObjectTypes } from "../../objectType/constants.js";
import type { IParameterMutationPort } from "../../parameter/parameterMutationPort.js";
import { createTestParameterMutationPort } from "../../parameter/tests/parameterMutationPort.test.utils.js";
import {
    TestPermissionsProvider,
    defaultPermissionsResult,
} from "../../permission/TestPermissionsProvider.js";
import { AsCodeCreateDialog } from "../AsCodeCreateDialog.js";
import { AsCodeDialog } from "../AsCodeDialog.js";
import { AsCodeEditDialog } from "../AsCodeEditDialog.js";
import type { IAsCodeDescriptor, IAsCodeEditing } from "../descriptor.js";

import { withMutationPort } from "./withMutationPort.js";

type TestDefinition = { id?: string };

// Exercised through the parameter descriptor (its context-aware validation is the richest probe).
const parameterDescriptor = getAsCodeDescriptor(ObjectTypes.PARAMETER)!;

const stubBackend = {} as unknown as IAnalyticalBackend;

vi.mock("../AsCodeEditorBody.js", () => import("./asCodeEditorBody.test.utils.js"));

const editItem: ICatalogItemParameter = {
    identifier: "test",
    type: "parameter",
    title: "Test parameter",
    description: "",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    definition: { type: "NUMBER", defaultValue: 1 },
};

function makeWrapper(settings: Partial<IUserWorkspaceSettings> = {}) {
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <TestIntlProvider>
                <BackendProvider backend={stubBackend}>
                    <WorkspaceProvider workspace="test-workspace">
                        <ToastsCenterContextProvider>
                            <TestPermissionsProvider
                                result={{
                                    ...defaultPermissionsResult,
                                    settings: settings as IUserWorkspaceSettings,
                                }}
                            >
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

const withParameterPort = (port: IParameterMutationPort) => withMutationPort(parameterDescriptor, port);

// Editor body is lazy behind Suspense — await it before typing.
async function typeYaml(value: string) {
    const editor = await screen.findByTestId("yaml-editor");
    fireEvent.change(editor, { target: { value } });
}

function clickSubmit(label: string) {
    fireEvent.click(screen.getByText(label, { selector: "button span, button" }));
}

function renderCreate(wrapper: (props: { children: ReactNode }) => ReactNode) {
    return render(<AsCodeCreateDialog descriptor={parameterDescriptor} onClose={vi.fn()} />, { wrapper });
}

// The dialog's editor body is `lazy()`, so the very first mount in this file commits the Suspense
// fallback — and React then holds the resolved content back for FALLBACK_THROTTLE_MS (300ms) to keep
// the spinner from flashing. That one-off 300ms landed on whichever test awaited the editor first.
// Resolving the lazy chunk once here, with the throttle timer faked away, leaves every later mount
// synchronous: no fallback, no throttle.
beforeAll(async () => {
    vi.useFakeTimers();
    try {
        const { unmount } = renderCreate(makeWrapper());
        await act(async () => {
            await vi.advanceTimersByTimeAsync(300);
        });
        unmount();
    } finally {
        vi.useRealTimers();
    }
});

describe("AsCodeDialog chrome", () => {
    it("renders the entity's help link", () => {
        renderCreate(makeWrapper());
        const link = screen.getByText("How to create a parameter?").closest("a");
        expect(link).toHaveAttribute(
            "href",
            "https://www.gooddata.ai/docs/cloud/experimental-features/numeric-parameters/",
        );
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("hides the help link on white-labeled deployments", () => {
        renderCreate(makeWrapper({ whiteLabeling: { enabled: true } }));
        expect(screen.queryByText("How to create a parameter?")).not.toBeInTheDocument();
    });
});

describe("AsCodeDialog validation display", () => {
    it("shows the entity error when the content is empty", async () => {
        renderCreate(makeWrapper());
        await typeYaml("");
        clickSubmit("Create");
        expect(screen.getByText("Parameter definition cannot be empty.")).toBeInTheDocument();
    });

    it("shows the entity error for invalid YAML", async () => {
        renderCreate(makeWrapper());
        await typeYaml("id: [foo");
        clickSubmit("Create");
        expect(screen.getByText("YAML syntax error")).toBeInTheDocument();
    });

    it("shows the entity error for an unsupported type", async () => {
        renderCreate(makeWrapper());
        await typeYaml("definition:\n  type: STRING\n  defaultValue: 1\n");
        clickSubmit("Create");
        expect(screen.getByText("Only NUMBER parameters are supported.")).toBeInTheDocument();
    });
});

describe("AsCodeDialog validation display with the entity's own context (string parameters enabled)", () => {
    const stringEnabled = makeWrapper({ enableStringParameters: true });

    it("lists every enabled type in the unsupported-type error", async () => {
        renderCreate(stringEnabled);
        await typeYaml("definition:\n  type: DATE\n  defaultValue: 1\n");
        clickSubmit("Create");
        expect(screen.getByText("Only NUMBER and STRING parameters are supported.")).toBeInTheDocument();
    });

    it("phrases the default-value error for the declared STRING type", async () => {
        renderCreate(stringEnabled);
        await typeYaml("definition:\n  type: STRING\n  defaultValue: 5\n");
        clickSubmit("Create");
        expect(
            screen.getByText(
                "Default value must be a string, listed in allowedValues when they are defined.",
            ),
        ).toBeInTheDocument();
    });
});

describe("AsCodeDialog submit", () => {
    it("passes the parsed definition to the port and reports success", async () => {
        const created = { ...editItem, identifier: "test" };
        const port = createTestParameterMutationPort({ create: vi.fn().mockResolvedValue(created) });
        const onCreated = vi.fn();
        render(
            <AsCodeCreateDialog
                descriptor={withParameterPort(port)}
                onClose={vi.fn()}
                onCreated={onCreated}
            />,
            { wrapper: makeWrapper() },
        );

        await typeYaml(`id: test
title: Test parameter
description: ""
tags: []
definition:
  type: NUMBER
  defaultValue: 1`);
        clickSubmit("Create");

        await waitFor(() =>
            expect(port.create).toHaveBeenCalledWith(
                expect.objectContaining({ id: "test", title: "Test parameter" }),
            ),
        );
        await waitFor(() => expect(onCreated).toHaveBeenCalledWith(created));
    });

    it("locks the dialog while a save is in flight", async () => {
        let resolveUpdate: () => void = () => {};
        const onClose = vi.fn();
        const port = createTestParameterMutationPort({
            update: vi.fn(
                () =>
                    new Promise<ICatalogItemParameter>((resolve) => {
                        resolveUpdate = () => resolve(editItem);
                    }),
            ),
        });
        render(<AsCodeEditDialog descriptor={withParameterPort(port)} item={editItem} onClose={onClose} />, {
            wrapper: makeWrapper(),
        });

        const editor = (await screen.findByTestId("yaml-editor")) as HTMLTextAreaElement;
        fireEvent.change(editor, {
            target: { value: editor.value.replace("Test parameter", "Edited parameter") },
        });
        await act(async () => {
            clickSubmit("Save");
        });

        expect(screen.getByTestId("yaml-editor")).toBeDisabled();
        expect(
            screen.getByText("Save", { selector: "button span, button" }).closest("button"),
        ).toHaveAttribute("aria-disabled", "true");
        expect(screen.getByText("Cancel").closest("button")).toHaveAttribute("aria-disabled", "true");
        expect(screen.queryByLabelText("Close dialog")).not.toBeInTheDocument();
        fireEvent.click(screen.getByText("Cancel"));
        expect(onClose).not.toHaveBeenCalled();

        await act(async () => resolveUpdate());
    });

    it("rejects an id change on save in edit mode", async () => {
        const port = createTestParameterMutationPort({ update: vi.fn() });
        render(<AsCodeEditDialog descriptor={withParameterPort(port)} item={editItem} onClose={vi.fn()} />, {
            wrapper: makeWrapper(),
        });

        const editor = (await screen.findByTestId("yaml-editor")) as HTMLTextAreaElement;
        fireEvent.change(editor, { target: { value: editor.value.replace("id: test", "id: another") } });
        clickSubmit("Save");

        expect(port.update).not.toHaveBeenCalled();
        expect(
            screen.getByText(
                "Parameter id cannot be changed when saving an existing parameter. Use Save as new instead.",
            ),
        ).toBeInTheDocument();
    });
});

describe("AsCodeEditDialog with a fetching seed", () => {
    it("surfaces the seed's loadError toast and closes when the fetch fails", async () => {
        const onClose = vi.fn();
        const failingDescriptor: IAsCodeDescriptor = {
            ...parameterDescriptor,
            seed: {
                load: () => Promise.reject(new Error("fetch failed")),
                loadError: { id: "analyticsCatalog.metric.load.error" },
            },
        };
        render(<AsCodeEditDialog descriptor={failingDescriptor} item={editItem} onClose={onClose} />, {
            wrapper: makeWrapper(),
        });

        await waitFor(() => expect(onClose).toHaveBeenCalled());
        // The toast renders both a visible message and an aria-live announcement.
        expect((await screen.findAllByText("The metric could not be loaded.")).length).toBeGreaterThan(0);
    });
});

describe("AsCodeDialog with an asynchronously-loaded editing brain", () => {
    // Lets a test flip the brain from loading (null) to resolved mid-dialog.
    const EditingContext = createContext<IAsCodeEditing<TestDefinition> | null>(null);

    const asyncDescriptor: IAsCodeDescriptor = {
        ...parameterDescriptor,
        useEditing: () => useContext(EditingContext),
    };

    const resolvedEditing: IAsCodeEditing<TestDefinition> = {
        completionSource: () => null,
        syntaxErrorMessage: "syntax",
        serialize: (definition) => ({ yaml: `serialized:${definition.id ?? "new"}`, hasCodeForm: true }),
        validate: () => ({ isValid: true, definition: { id: "x" } }),
    };

    const initialDefinition: TestDefinition = { id: "seed" };

    function renderDialog(editing: IAsCodeEditing<TestDefinition> | null) {
        return (
            <EditingContext.Provider value={editing}>
                <AsCodeDialog
                    descriptor={asyncDescriptor}
                    mode="create"
                    initialDefinition={initialDefinition}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                />
            </EditingContext.Provider>
        );
    }

    it("withholds the editor until the brain resolves, then seeds it from the resolved serialize", async () => {
        const { rerender } = render(renderDialog(null), { wrapper: makeWrapper() });

        expect(screen.queryByTestId("yaml-editor")).not.toBeInTheDocument();

        rerender(renderDialog(resolvedEditing));

        const editor = await screen.findByTestId("yaml-editor");
        expect(editor).toHaveValue("serialized:seed");
    });

    it("requests the brain on open; a rejection surfaces the seed's loadError and closes", async () => {
        const onClose = vi.fn();
        const requestEditing = vi.fn(() => Promise.reject(new Error("brain build failed")));
        const failingDescriptor: IAsCodeDescriptor = {
            ...asyncDescriptor,
            seed: {
                load: async () => ({}),
                loadError: { id: "analyticsCatalog.metric.load.error" },
            },
            useRequestEditing: () => requestEditing,
        };
        render(
            <EditingContext.Provider value={null}>
                <AsCodeDialog
                    descriptor={failingDescriptor}
                    mode="create"
                    initialDefinition={initialDefinition}
                    onClose={onClose}
                    onSubmit={vi.fn()}
                />
            </EditingContext.Provider>,
            { wrapper: makeWrapper() },
        );

        await waitFor(() => expect(onClose).toHaveBeenCalled());
        expect(requestEditing).toHaveBeenCalled();
        // The toast renders both a visible message and an aria-live announcement.
        expect((await screen.findAllByText("The metric could not be loaded.")).length).toBeGreaterThan(0);
        expect(screen.queryByTestId("yaml-editor")).not.toBeInTheDocument();
    });

    it("stays open on its loading state while the brain request is pending", async () => {
        const onClose = vi.fn();
        const pending = new Promise<void>(() => {});
        render(
            <EditingContext.Provider value={null}>
                <AsCodeDialog
                    descriptor={{ ...asyncDescriptor, useRequestEditing: () => () => pending }}
                    mode="create"
                    initialDefinition={initialDefinition}
                    onClose={onClose}
                    onSubmit={vi.fn()}
                />
            </EditingContext.Provider>,
            { wrapper: makeWrapper() },
        );

        await waitFor(() => expect(screen.getByText("Create parameter")).toBeInTheDocument());
        expect(onClose).not.toHaveBeenCalled();
    });

    it("stays silent when the brain request fails after the dialog is gone", async () => {
        const onClose = vi.fn();
        let rejectRequest: (error: Error) => void = () => {};
        const requestEditing = () =>
            new Promise<void>((_, reject) => {
                rejectRequest = reject;
            });
        const { unmount } = render(
            <EditingContext.Provider value={null}>
                <AsCodeDialog
                    descriptor={{ ...asyncDescriptor, useRequestEditing: () => requestEditing }}
                    mode="create"
                    initialDefinition={initialDefinition}
                    onClose={onClose}
                    onSubmit={vi.fn()}
                />
            </EditingContext.Provider>,
            { wrapper: makeWrapper() },
        );

        unmount();
        await act(async () => {
            rejectRequest(new Error("late failure"));
        });

        expect(onClose).not.toHaveBeenCalled();
    });

    it("closes the dialog instead of crashing when serialize throws", async () => {
        // Serialize runs during render, so a throw must route to the close path, not propagate.
        const onClose = vi.fn();
        render(
            <EditingContext.Provider
                value={{
                    ...resolvedEditing,
                    serialize: () => {
                        throw new Error("cannot serialize");
                    },
                }}
            >
                <AsCodeDialog
                    descriptor={asyncDescriptor}
                    mode="create"
                    initialDefinition={initialDefinition}
                    onClose={onClose}
                    onSubmit={vi.fn()}
                />
            </EditingContext.Provider>,
            { wrapper: makeWrapper() },
        );

        await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
        expect(screen.queryByTestId("yaml-editor")).not.toBeInTheDocument();
    });

    it("reconciles the validated edits against the base before submitting, in edit mode", async () => {
        const reconcile = vi.fn(() => ({ id: "reconciled" }));
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        render(
            <EditingContext.Provider value={{ ...resolvedEditing, reconcile }}>
                <AsCodeDialog
                    descriptor={asyncDescriptor}
                    mode="edit"
                    initialDefinition={{ id: "base" }}
                    fixedIdentifier="base"
                    onClose={vi.fn()}
                    onSubmit={onSubmit}
                />
            </EditingContext.Provider>,
            { wrapper: makeWrapper() },
        );

        const editor = await screen.findByTestId("yaml-editor");
        fireEvent.change(editor, { target: { value: "id: base\nedited: true" } });
        clickSubmit("Save");

        await waitFor(() => expect(reconcile).toHaveBeenCalledWith({ id: "base" }, { id: "x" }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ id: "reconciled" }));
    });

    it("reconciles the validated edits against the base before duplicating, so nothing is dropped", async () => {
        const reconcile = vi.fn(() => ({ id: "reconciled" }));
        const onDuplicate = vi.fn();
        render(
            <EditingContext.Provider value={{ ...resolvedEditing, reconcile }}>
                <AsCodeDialog
                    descriptor={asyncDescriptor}
                    mode="edit"
                    initialDefinition={{ id: "base" }}
                    fixedIdentifier="base"
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                    onDuplicate={onDuplicate}
                />
            </EditingContext.Provider>,
            { wrapper: makeWrapper() },
        );

        const editor = await screen.findByTestId("yaml-editor");
        fireEvent.change(editor, { target: { value: "id: base\nedited: true" } });
        clickSubmit("Save as new");

        await waitFor(() => expect(reconcile).toHaveBeenCalledWith({ id: "base" }, { id: "x" }));
        await waitFor(() => expect(onDuplicate).toHaveBeenCalledWith({ id: "reconciled" }));
    });

    it("reconciles against the copy source when persisting a create, so a duplicate keeps hidden content", async () => {
        const reconcile = vi.fn(() => ({ id: "reconciled" }));
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        render(
            <EditingContext.Provider value={{ ...resolvedEditing, reconcile }}>
                <AsCodeDialog
                    descriptor={asyncDescriptor}
                    mode="create"
                    initialDefinition={{ id: "copy-source" }}
                    onClose={vi.fn()}
                    onSubmit={onSubmit}
                />
            </EditingContext.Provider>,
            { wrapper: makeWrapper() },
        );

        const editor = await screen.findByTestId("yaml-editor");
        fireEvent.change(editor, { target: { value: "id: copy-source\nedited: true" } });
        clickSubmit("Create");

        await waitFor(() => expect(reconcile).toHaveBeenCalledWith({ id: "copy-source" }, { id: "x" }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ id: "reconciled" }));
    });

    it("names the flow when validating: edit on submit, duplicate on Save as new", async () => {
        // A duplicate's document still carries the source id, so the flow must be named explicitly.
        const validate = vi.fn(() => ({ isValid: true as const, definition: { id: "x" } }));
        const onDuplicate = vi.fn();
        render(
            <EditingContext.Provider value={{ ...resolvedEditing, validate }}>
                <AsCodeDialog
                    descriptor={asyncDescriptor}
                    mode="edit"
                    initialDefinition={{ id: "base" }}
                    fixedIdentifier="base"
                    onClose={vi.fn()}
                    onSubmit={vi.fn().mockResolvedValue(undefined)}
                    onDuplicate={onDuplicate}
                />
            </EditingContext.Provider>,
            { wrapper: makeWrapper() },
        );

        const editor = await screen.findByTestId("yaml-editor");
        fireEvent.change(editor, { target: { value: "id: base\nedited: true" } });

        clickSubmit("Save as new");
        await waitFor(() =>
            expect(validate).toHaveBeenLastCalledWith(expect.any(String), { intent: "duplicate" }),
        );
        expect(onDuplicate).toHaveBeenCalled();

        clickSubmit("Save");
        await waitFor(() =>
            expect(validate).toHaveBeenLastCalledWith(expect.any(String), {
                intent: "edit",
                fixedIdentifier: "base",
            }),
        );
    });

    it("validates a create submit with the create intent", async () => {
        const validate = vi.fn(() => ({ isValid: true as const, definition: { id: "x" } }));
        render(
            <EditingContext.Provider value={{ ...resolvedEditing, validate }}>
                <AsCodeDialog
                    descriptor={asyncDescriptor}
                    mode="create"
                    initialDefinition={initialDefinition}
                    onClose={vi.fn()}
                    onSubmit={vi.fn().mockResolvedValue(undefined)}
                />
            </EditingContext.Provider>,
            { wrapper: makeWrapper() },
        );

        await screen.findByTestId("yaml-editor");
        clickSubmit("Create");
        await waitFor(() =>
            expect(validate).toHaveBeenLastCalledWith(expect.any(String), { intent: "create" }),
        );
    });
});

describe("AsCodeDialog with a base the codec cannot represent", () => {
    // Mirrors the real codec: unprojectable content serializes to a comment note, reported as no code form.
    const noteEditing: IAsCodeEditing<TestDefinition> = {
        completionSource: () => null,
        syntaxErrorMessage: "syntax",
        serialize: () => ({ yaml: "# unsupported content", hasCodeForm: false }),
        validate: (value) =>
            value.trimStart().startsWith("#")
                ? { isValid: false as const, error: "no code representation" }
                : { isValid: true as const, definition: { id: "x" } },
    };

    const noticePattern = /cannot be represented as code/;

    function renderEdit(editing: IAsCodeEditing<TestDefinition>, onClose = vi.fn()) {
        render(
            <AsCodeDialog
                descriptor={{ ...parameterDescriptor, useEditing: () => editing }}
                mode="edit"
                fixedIdentifier="seed"
                initialDefinition={{ id: "seed" }}
                onClose={onClose}
                onSubmit={vi.fn()}
                onDuplicate={vi.fn()}
            />,
            { wrapper: makeWrapper() },
        );
        return { onClose };
    }

    const buttonNamed = (label: string) =>
        screen.getByText(label, { selector: "button span, button" }).closest("button");

    it("shows the note read-only and blocks both persisting actions", async () => {
        renderEdit(noteEditing);

        expect(await screen.findByTestId("yaml-editor")).toBeDisabled();
        expect(screen.getByText(noticePattern)).toBeInTheDocument();
        expect(buttonNamed("Save")).toHaveAttribute("aria-disabled", "true");
        // Duplicating would carry the same unusable baseline into the copy.
        expect(buttonNamed("Save as new")).toBeDisabled();
    });

    it("leaves the editor writable for a document the codec rejects but can still render", async () => {
        renderEdit({
            ...noteEditing,
            serialize: () => ({ yaml: "id: seed", hasCodeForm: true }),
            validate: () => ({ isValid: false as const, error: "type not enabled" }),
        });

        expect(await screen.findByTestId("yaml-editor")).not.toBeDisabled();
        expect(screen.queryByText(noticePattern)).not.toBeInTheDocument();
        expect(buttonNamed("Save as new")).not.toBeDisabled();
    });

    it("reports a base that cannot be serialized as a failure to load", async () => {
        const { onClose } = renderEdit({
            ...noteEditing,
            serialize: () => {
                throw new Error("serialize blew up");
            },
        });

        await waitFor(() => expect(onClose).toHaveBeenCalled());
    });

    it("leaves the editor writable when the base has a code form", async () => {
        renderEdit({ ...noteEditing, serialize: () => ({ yaml: "id: seed", hasCodeForm: true }) });

        expect(await screen.findByTestId("yaml-editor")).not.toBeDisabled();
        expect(screen.queryByText(noticePattern)).not.toBeInTheDocument();
    });
});
