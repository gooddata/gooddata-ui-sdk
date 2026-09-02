// (C) 2026 GoodData Corporation

import { type ComponentType, type ReactNode, useMemo } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The AutomationsContext module is NOT mocked: the subject is a decorator re-providing that
// context, so the real provider/hook pair must run. The store-backed builder hook is mocked
// because no dashboard store is wired here.

// `isolate: false` shares one module graph per worker, so the modules mocked below may already
// have been evaluated — against their real dependencies — by a test file that ran earlier in the
// same worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

const { mockUseBuildAutomationsContext } = vi.hoisted(() => ({
    mockUseBuildAutomationsContext: vi.fn(),
}));

vi.mock("./hooks/useBuildAutomationsContext.js", () => ({
    useBuildAutomationsContext: mockUseBuildAutomationsContext,
}));

vi.mock("../../dashboardContexts/DashboardComponentsContext.js", () => ({
    useDashboardComponentsContext: () => ({
        AutomationsContextDecoratorComponent: resolvedDecorator,
    }),
}));

import { DefaultDialogContextDecorator } from "../../dashboardContexts/DefaultDialogContextDecorator.js";
import { AutomationsContextProvider, useAutomationsContext } from "../contexts/AutomationsContext.js";

import { AlertingAutomationsProvider } from "./AlertingConnector.js";
import { ScheduledEmailAutomationsProvider } from "./ScheduledEmailConnector.js";

// Partial context literal through the untyped builder mock — the established idiom of the
// sibling decorator suites; the probe and decorator only touch the members set here.
const BASE_DATE_FILTER_CONFIG = {
    availableGranularities: ["GDC.time.date", "GDC.time.month"],
    dateFilterOptions: {},
    getGranularitiesForTab: () => ["GDC.time.date", "GDC.time.month"],
    getOptionsForTab: () => undefined,
};

/**
 * Stands in for a customer decorator (the MC-4271 shape): constrains the date-filter
 * granularities — availableGranularities and getGranularitiesForTab overridden together.
 */
function GranularityCappingDecorator({ children }: { children?: ReactNode }) {
    const ctx = useAutomationsContext();
    const decorated = useMemo(
        () => ({
            ...ctx,
            dateFilterConfig: {
                ...ctx.dateFilterConfig,
                availableGranularities: ["GDC.time.month" as const],
                getGranularitiesForTab: () => ["GDC.time.month" as const],
            },
        }),
        [ctx],
    );
    return <AutomationsContextProvider value={decorated}>{children}</AutomationsContextProvider>;
}

/** Stands in for any consumer under the wrapper — dialogs, blocks, state providers alike. */
function GranularityProbe() {
    const ctx = useAutomationsContext();
    return <div data-testid="granularities">{ctx.dateFilterConfig.availableGranularities.join(",")}</div>;
}

let resolvedDecorator: ComponentType<{ children?: ReactNode }>;

beforeEach(() => {
    resolvedDecorator = GranularityCappingDecorator;
    mockUseBuildAutomationsContext.mockReturnValue({
        dateFilterConfig: BASE_DATE_FILTER_CONFIG,
    });
});

describe("AutomationsContext decorator slot", () => {
    it("alerting tree: a consumer under the wrapper reads the decorated context", () => {
        render(
            <AlertingAutomationsProvider>
                <GranularityProbe />
            </AlertingAutomationsProvider>,
        );

        expect(screen.getByTestId("granularities")).toHaveTextContent(/^GDC\.time\.month$/);
    });

    it("alerting tree: the passthrough default is inert", () => {
        resolvedDecorator = DefaultDialogContextDecorator;

        render(
            <AlertingAutomationsProvider>
                <GranularityProbe />
            </AlertingAutomationsProvider>,
        );

        expect(screen.getByTestId("granularities")).toHaveTextContent("GDC.time.date,GDC.time.month");
    });

    it("scheduled email tree: a consumer under the wrapper reads the decorated context", () => {
        render(
            <ScheduledEmailAutomationsProvider>
                <GranularityProbe />
            </ScheduledEmailAutomationsProvider>,
        );

        expect(screen.getByTestId("granularities")).toHaveTextContent(/^GDC\.time\.month$/);
    });

    it("scheduled email tree: the passthrough default is inert", () => {
        resolvedDecorator = DefaultDialogContextDecorator;

        render(
            <ScheduledEmailAutomationsProvider>
                <GranularityProbe />
            </ScheduledEmailAutomationsProvider>,
        );

        expect(screen.getByTestId("granularities")).toHaveTextContent("GDC.time.date,GDC.time.month");
    });
});
