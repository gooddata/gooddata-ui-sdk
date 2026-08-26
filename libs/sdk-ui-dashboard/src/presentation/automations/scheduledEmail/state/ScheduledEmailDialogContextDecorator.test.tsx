// (C) 2026 GoodData Corporation

import { type ComponentType, type ReactElement, type ReactNode, useMemo } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type INotificationChannelIdentifier } from "@gooddata/sdk-model";

// ---------------------------------------------------------------------------
// Mocks — unlike ScheduledEmailDialogStateProvider.test.tsx, the ScheduledEmailDialogContext
// module is NOT mocked: the subject is a decorator re-providing that context, so the real
// provider/hook pair must run. The store-backed hooks are mocked because no dashboard store is
// wired here; `useScheduledEmailFormState` and the state provider run for real — the
// seed-follows-decoration behaviour under test lives there.
// ---------------------------------------------------------------------------

const {
    mockUseAutomationsContext,
    mockUseAutomationFiltersSelect,
    mockUseValidateExistingAutomationFilters,
    mockUseAutomationExportParameters,
} = vi.hoisted(() => ({
    mockUseAutomationsContext: vi.fn(),
    mockUseAutomationFiltersSelect: vi.fn(),
    mockUseValidateExistingAutomationFilters: vi.fn(),
    mockUseAutomationExportParameters: vi.fn(),
}));

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../contexts/AutomationsContext.js", () => ({
    useAutomationsContext: mockUseAutomationsContext,
}));

vi.mock("../../shared/automationFilters/useAutomationFiltersSelect.js", () => ({
    useAutomationFiltersSelect: mockUseAutomationFiltersSelect,
}));

vi.mock("../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

vi.mock("../../shared/automationFilters/useAutomationExportParameters.js", () => ({
    useAutomationExportParameters: mockUseAutomationExportParameters,
}));

vi.mock("../../../dashboardContexts/DashboardComponentsContext.js", () => ({
    useDashboardComponentsContext: () => ({
        ScheduledEmailDialogComponent: GuardedStubScheduledEmailDialogComponent,
        ScheduledEmailDialogContextDecoratorComponent: resolvedDecorator,
    }),
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import { DefaultDialogContextDecorator } from "../../../dashboardContexts/DefaultDialogContextDecorator.js";
import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import {
    type IScheduledEmailDialogContextValue,
    ScheduledEmailDialogContextProvider,
    useScheduledEmailDialogContext,
} from "../../contexts/ScheduledEmailDialogContext.js";
import { ScheduledEmailDialog } from "../ScheduledEmailDialog.js";
import {
    AUTOMATIONS_CONTEXT,
    SCHEDULED_EMAIL_DIALOG_CONTEXT,
    SENTINEL_CHANNEL,
} from "../tests/scheduledEmail.test.helpers.js";

import { useScheduledExportDraft } from "./ScheduledExportDraftContext.js";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const DECORATED_CHANNEL: INotificationChannelIdentifier = {
    ...SENTINEL_CHANNEL,
    id: "decorated-channel",
};

// The base context deliberately has no channels: any channel the state model seeds from can
// only have come through the decorator.
const BASE_CONTEXT: IScheduledEmailDialogContextValue = {
    ...SCHEDULED_EMAIL_DIALOG_CONTEXT,
    notificationChannels: [],
};

/**
 * Stands in for a customer decorator: re-provides the read context with `notificationChannels`
 * decorated, everything else — including `isLoading` — untouched.
 */
function DecoratingDecorator({ children }: { children?: ReactNode }) {
    const ctx = useScheduledEmailDialogContext();
    const decorated = useMemo(() => ({ ...ctx, notificationChannels: [DECORATED_CHANNEL] }), [ctx]);
    return (
        <ScheduledEmailDialogContextProvider value={decorated}>
            {children}
        </ScheduledEmailDialogContextProvider>
    );
}

/**
 * Stands in for the resolved dialog. Honours the accessors' documented contract (isLoading
 * check first), then reads one direct context member and one state-model-seeded member — the
 * pair that distinguishes this slot's placement from a decorator mounted below the state
 * provider, where only the direct read follows the decoration.
 */
function GuardedStubScheduledEmailDialogComponent() {
    const ctx = useScheduledEmailDialogContext();

    if (ctx.isLoading) {
        return <div data-testid="gate">LOADING</div>;
    }

    return (
        <>
            <div data-testid="direct-channel">{ctx.notificationChannels[0]?.id ?? "NONE"}</div>
            <SeededChannelProbe />
        </>
    );
}

function SeededChannelProbe() {
    const { editedAutomation } = useScheduledExportDraft();
    return <div data-testid="draft-channel">{editedAutomation.notificationChannel ?? "NONE"}</div>;
}

let resolvedDecorator: ComponentType<{ children?: ReactNode }>;

function renderSeam(value: IScheduledEmailDialogContextValue) {
    return render(
        <IntlWrapper>
            <ScheduledEmailDialogContextProvider value={value}>
                <ScheduledEmailDialog onCancel={vi.fn()} />
            </ScheduledEmailDialogContextProvider>
        </IntlWrapper>,
    );
}

function rerenderSeam(rerender: (ui: ReactElement) => void, value: IScheduledEmailDialogContextValue) {
    rerender(
        <IntlWrapper>
            <ScheduledEmailDialogContextProvider value={value}>
                <ScheduledEmailDialog onCancel={vi.fn()} />
            </ScheduledEmailDialogContextProvider>
        </IntlWrapper>,
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    resolvedDecorator = DecoratingDecorator;

    mockUseAutomationsContext.mockReturnValue(AUTOMATIONS_CONTEXT);
    mockUseAutomationFiltersSelect.mockReturnValue({
        editedAutomationFilters: [],
        setEditedAutomationFilters: vi.fn(),
        storeFilters: true,
        setStoreFilters: vi.fn(),
        availableFilters: [],
        availableFiltersAsVisibleFilters: undefined,
        filtersForNewAutomation: [],
        filtersByTab: undefined,
        editedAutomationFiltersByTab: undefined,
        setEditedAutomationFiltersByTab: vi.fn(),
        availableFiltersAsVisibleFiltersByTab: undefined,
    });
    mockUseValidateExistingAutomationFilters.mockReturnValue({ isValid: true, filtersAreStale: false });
    mockUseAutomationExportParameters.mockReturnValue({
        parametersEnabled: false,
        visibleParametersByTab: {},
        availableParametersByTab: {},
        flatTabId: undefined,
        onParameterAdd: vi.fn(),
        onParameterChange: vi.fn(),
        onParameterDelete: vi.fn(),
        onParameterAddByTab: vi.fn(),
        onParameterChangeByTab: vi.fn(),
        onParameterDeleteByTab: vi.fn(),
        applyLatest: vi.fn(),
        onStoreParametersChange: vi.fn(),
    });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ScheduledEmailDialog context-decorator slot", () => {
    it("seeds the state model from the decorated context, not just direct reads", () => {
        renderSeam(BASE_CONTEXT);

        expect(screen.getByTestId("direct-channel")).toHaveTextContent(DECORATED_CHANNEL.id);
        expect(screen.getByTestId("draft-channel")).toHaveTextContent(DECORATED_CHANNEL.id);
    });

    it("keeps the loading gate: a decorator that passes isLoading through seeds after the flip", () => {
        const { rerender } = renderSeam({ ...BASE_CONTEXT, isLoading: true });

        expect(screen.getByTestId("gate")).toHaveTextContent("LOADING");

        rerenderSeam(rerender, { ...BASE_CONTEXT, isLoading: false });

        expect(screen.getByTestId("draft-channel")).toHaveTextContent(DECORATED_CHANNEL.id);
    });

    it("is inert with the passthrough default: the state model seeds from the connector context", () => {
        resolvedDecorator = DefaultDialogContextDecorator;

        renderSeam({ ...SCHEDULED_EMAIL_DIALOG_CONTEXT, notificationChannels: [SENTINEL_CHANNEL] });

        expect(screen.getByTestId("direct-channel")).toHaveTextContent(SENTINEL_CHANNEL.id);
        expect(screen.getByTestId("draft-channel")).toHaveTextContent(SENTINEL_CHANNEL.id);
    });
});
