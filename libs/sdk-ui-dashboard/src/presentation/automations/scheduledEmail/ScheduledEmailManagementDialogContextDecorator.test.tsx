// (C) 2026 GoodData Corporation

import { type ComponentType, type ReactNode, useMemo } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

// The ScheduledEmailManagementDialogContext module is NOT mocked: the subject is a decorator
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
        ScheduledEmailManagementDialogComponent: StubManagementDialogComponent,
        ScheduledEmailManagementDialogContextDecoratorComponent: resolvedDecorator,
    }),
}));

import { DefaultDialogContextDecorator } from "../../dashboardContexts/DefaultDialogContextDecorator.js";
import {
    ScheduledEmailManagementDialogContextProvider,
    type IScheduledEmailManagementDialogContextValue,
    useScheduledEmailManagementDialogContext,
} from "../contexts/ScheduledEmailManagementDialogContext.js";

import { ScheduledEmailManagementDialog } from "./ScheduledEmailManagementDialog.js";
import { type IScheduledEmailManagementDialogProps } from "./types.js";

const CONNECTOR_AUTOMATION = { id: "connector-schedule", title: "Connector" } as IAutomationMetadataObject;
const DECORATED_AUTOMATION = { id: "decorated-schedule", title: "Decorated" } as IAutomationMetadataObject;

const BASE_CONTEXT: IScheduledEmailManagementDialogContextValue = {
    isScheduleEmailDialogOpen: false,
    enableAccessibilityMode: false,
    isEmbedded: false,
    maxAutomations: 10,
    unlimitedAutomations: false,
    automations: [CONNECTOR_AUTOMATION],
    isLoading: false,
};

/**
 * Stands in for a customer decorator: substitutes the automations list and extends isLoading —
 * the two members the seam exists for.
 */
function DecoratingDecorator({ children }: { children?: ReactNode }) {
    const ctx = useScheduledEmailManagementDialogContext();
    const decorated = useMemo(
        () => ({ ...ctx, automations: [DECORATED_AUTOMATION], isLoading: true }),
        [ctx],
    );
    return (
        <ScheduledEmailManagementDialogContextProvider value={decorated}>
            {children}
        </ScheduledEmailManagementDialogContextProvider>
    );
}

/** Stands in for the resolved management dialog (default or replacement): reads the context. */
function StubManagementDialogComponent(_props: IScheduledEmailManagementDialogProps) {
    const ctx = useScheduledEmailManagementDialogContext();
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
        <ScheduledEmailManagementDialogContextProvider value={BASE_CONTEXT}>
            <ScheduledEmailManagementDialog />
        </ScheduledEmailManagementDialogContextProvider>,
    );
}

beforeEach(() => {
    resolvedDecorator = DecoratingDecorator;
});

describe("ScheduledEmailManagementDialog context-decorator slot", () => {
    it("renders the resolved dialog inside the decorated context", () => {
        renderSeam();

        expect(screen.getByTestId("automations")).toHaveTextContent("decorated-schedule");
        expect(screen.getByTestId("is-loading")).toHaveTextContent("true");
    });

    it("is inert with the passthrough default: the dialog reads the connector context", () => {
        resolvedDecorator = DefaultDialogContextDecorator;

        renderSeam();

        expect(screen.getByTestId("automations")).toHaveTextContent("connector-schedule");
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });
});
