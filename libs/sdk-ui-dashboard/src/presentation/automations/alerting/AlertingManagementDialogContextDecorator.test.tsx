// (C) 2026 GoodData Corporation

import { type ComponentType, type ReactNode, useMemo } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

// The AlertingManagementDialogContext module is NOT mocked: the subject is a decorator
// re-providing that context, so the real provider/hook pair must run.

// `isolate: false` shares one module graph per worker, so the module mocked below may already have
// been evaluated — against its real dependencies — by a test file that ran earlier in the same
// worker, which turns the `vi.mock()` call into a no-op. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mock.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../dashboardContexts/DashboardComponentsContext.js", () => ({
    useDashboardComponentsContext: () => ({
        AlertingManagementDialogComponent: StubManagementDialogComponent,
        AlertingManagementDialogContextDecoratorComponent: resolvedDecorator,
    }),
}));

import { DefaultDialogContextDecorator } from "../../dashboardContexts/DefaultDialogContextDecorator.js";
import {
    AlertingManagementDialogContextProvider,
    type IAlertingManagementDialogContextValue,
    useAlertingManagementDialogContext,
} from "../contexts/AlertingManagementDialogContext.js";

import { AlertingManagementDialog } from "./AlertingManagementDialog.js";
import { type IAlertingManagementDialogProps } from "./types.js";

const CONNECTOR_AUTOMATION = { id: "connector-alert", title: "Connector" } as IAutomationMetadataObject;
const DECORATED_AUTOMATION = { id: "decorated-alert", title: "Decorated" } as IAutomationMetadataObject;

const BASE_CONTEXT: IAlertingManagementDialogContextValue = {
    canManageWorkspace: true,
    isAlertDialogOpen: false,
    managementDialogContext: {},
    isEmbedded: false,
    enableAccessibilityMode: false,
    automations: [CONNECTOR_AUTOMATION],
    isLoading: false,
    getWidgetByRef: () => undefined,
    getInsightByWidgetRef: () => undefined,
    pauseAlert: () => Promise.resolve(CONNECTOR_AUTOMATION),
    resumeAlert: () => Promise.resolve(CONNECTOR_AUTOMATION),
};

/**
 * Stands in for a customer decorator: substitutes the automations list and extends isLoading —
 * the two members the seam exists for.
 */
function DecoratingDecorator({ children }: { children?: ReactNode }) {
    const ctx = useAlertingManagementDialogContext();
    const decorated = useMemo(
        () => ({ ...ctx, automations: [DECORATED_AUTOMATION], isLoading: true }),
        [ctx],
    );
    return (
        <AlertingManagementDialogContextProvider value={decorated}>
            {children}
        </AlertingManagementDialogContextProvider>
    );
}

/** Stands in for the resolved management dialog (default or replacement): reads the context. */
function StubManagementDialogComponent(_props: IAlertingManagementDialogProps) {
    const ctx = useAlertingManagementDialogContext();
    return (
        <>
            <div data-testid="automations">{ctx.automations.map((a) => a.id).join(",")}</div>
            <div data-testid="is-loading">{String(ctx.isLoading)}</div>
        </>
    );
}

let resolvedDecorator: ComponentType<{ children?: ReactNode }>;

function renderSeam() {
    return render(
        <AlertingManagementDialogContextProvider value={BASE_CONTEXT}>
            <AlertingManagementDialog onPauseSuccess={() => {}} onPauseError={() => {}} />
        </AlertingManagementDialogContextProvider>,
    );
}

beforeEach(() => {
    resolvedDecorator = DecoratingDecorator;
});

describe("AlertingManagementDialog context-decorator slot", () => {
    it("renders the resolved dialog inside the decorated context", () => {
        renderSeam();

        expect(screen.getByTestId("automations")).toHaveTextContent("decorated-alert");
        expect(screen.getByTestId("is-loading")).toHaveTextContent("true");
    });

    it("is inert with the passthrough default: the dialog reads the connector context", () => {
        resolvedDecorator = DefaultDialogContextDecorator;

        renderSeam();

        expect(screen.getByTestId("automations")).toHaveTextContent("connector-alert");
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });
});
