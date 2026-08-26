// (C) 2026 GoodData Corporation

import { type ComponentType, type ReactElement, type ReactNode, useMemo } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IInsight, type INotificationChannelIdentifier, idRef } from "@gooddata/sdk-model";

// ---------------------------------------------------------------------------
// Mocks — unlike AlertingDialogStateProvider.test.tsx, the AlertingDialogContext module is NOT
// mocked: the subject is a decorator re-providing that context, so the real provider/hook pair
// must run. The store-backed hooks are mocked because no dashboard store is wired here;
// `useAlertFormState` and the state provider run for real — the seed-follows-decoration
// behaviour under test lives there.
// ---------------------------------------------------------------------------

const {
    mockUseAutomationsContext,
    mockUseAutomationFiltersSelect,
    mockUseValidateExistingAutomationFilters,
    mockUseAutomationAlertParameters,
    mockUseAlertSupportedMetrics,
} = vi.hoisted(() => ({
    mockUseAutomationsContext: vi.fn(),
    mockUseAutomationFiltersSelect: vi.fn(),
    mockUseValidateExistingAutomationFilters: vi.fn(),
    mockUseAutomationAlertParameters: vi.fn(),
    mockUseAlertSupportedMetrics: vi.fn(),
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

vi.mock("../../shared/automationFilters/useAutomationAlertParameters.js", () => ({
    useAutomationAlertParameters: mockUseAutomationAlertParameters,
}));

vi.mock("./useAlertSupportedMetrics.js", () => ({
    useAlertSupportedMetrics: mockUseAlertSupportedMetrics,
}));

vi.mock("../../../dashboardContexts/DashboardComponentsContext.js", () => ({
    useDashboardComponentsContext: () => ({
        AlertingDialogComponent: GuardedStubAlertingDialogComponent,
        AlertingDialogContextDecoratorComponent: resolvedDecorator,
    }),
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import { DefaultDialogContextDecorator } from "../../../dashboardContexts/DefaultDialogContextDecorator.js";
import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import {
    AlertingDialogContextProvider,
    type IAlertingDialogContextValue,
    useAlertingDialogContext,
} from "../../contexts/AlertingDialogContext.js";
import { AlertingDialog } from "../AlertingDialog.js";
import {
    ALERTING_DIALOG_CONTEXT,
    SENTINEL_CHANNEL,
    SENTINEL_MEASURE,
} from "../tests/alerting.test.helpers.js";

import { useAlertDraft } from "./AlertDraftContext.js";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const DECORATED_INSIGHT: IInsight = {
    insight: {
        identifier: "decorated-insight",
        uri: "/decorated-insight",
        ref: idRef("decorated-insight", "insight"),
        title: "Decorated",
        visualizationUrl: "local:table",
        buckets: [],
        filters: [],
        sorts: [],
        properties: {},
    },
};

const DECORATED_CHANNEL: INotificationChannelIdentifier = {
    ...SENTINEL_CHANNEL,
    id: "decorated-channel",
};

// The base context deliberately has no channels and no insight: any channel/insight the state
// model sees can only have come through the decorator.
const BASE_CONTEXT: IAlertingDialogContextValue = {
    ...ALERTING_DIALOG_CONTEXT,
    insight: undefined,
    notificationChannels: [],
};

/**
 * Stands in for a customer decorator: re-provides the read context with `insight` and
 * `notificationChannels` decorated, everything else — including `isLoading` — untouched.
 */
function DecoratingDecorator({ children }: { children?: ReactNode }) {
    const ctx = useAlertingDialogContext();
    const decorated = useMemo(
        () => ({ ...ctx, insight: DECORATED_INSIGHT, notificationChannels: [DECORATED_CHANNEL] }),
        [ctx],
    );
    return <AlertingDialogContextProvider value={decorated}>{children}</AlertingDialogContextProvider>;
}

/**
 * Stands in for the resolved dialog. Honours the accessors' documented contract (isLoading
 * check first), then reads one direct context member and one state-model-seeded member — the
 * pair that distinguishes this slot's placement from a decorator mounted below the state
 * provider, where only the direct read follows the decoration.
 */
function GuardedStubAlertingDialogComponent() {
    const ctx = useAlertingDialogContext();

    if (ctx.isLoading) {
        return <div data-testid="gate">LOADING</div>;
    }

    return (
        <>
            <div data-testid="direct-insight">{ctx.insight?.insight.identifier ?? "NONE"}</div>
            <SeededChannelProbe />
        </>
    );
}

function SeededChannelProbe() {
    const { editedAutomation } = useAlertDraft();
    return <div data-testid="draft-channel">{editedAutomation?.notificationChannel ?? "NONE"}</div>;
}

let resolvedDecorator: ComponentType<{ children?: ReactNode }>;

function renderSeam(value: IAlertingDialogContextValue) {
    return render(
        <IntlWrapper>
            <AlertingDialogContextProvider value={value}>
                <AlertingDialog onCancel={vi.fn()} />
            </AlertingDialogContextProvider>
        </IntlWrapper>,
    );
}

function rerenderSeam(rerender: (ui: ReactElement) => void, value: IAlertingDialogContextValue) {
    rerender(
        <IntlWrapper>
            <AlertingDialogContextProvider value={value}>
                <AlertingDialog onCancel={vi.fn()} />
            </AlertingDialogContextProvider>
        </IntlWrapper>,
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    resolvedDecorator = DecoratingDecorator;

    mockUseAutomationsContext.mockReturnValue({
        catalogDateDatasets: [],
        catalogAttributes: [],
        separators: undefined,
        weekStart: "Monday" as const,
        timezone: "Europe/Prague",
        allowHourlyRecurrence: false,
        settings: undefined,
        currentUser: { ref: { identifier: "user1" }, login: "user1" },
        widgetLocalIdToTabIdMap: {} as Record<string, string>,
        features: { enableAlertOncePerInterval: false },
        maxAutomationsRecipients: 5,
        externalRecipient: undefined as string | undefined,
    });
    mockUseAutomationFiltersSelect.mockReturnValue({
        editedAutomationFilters: [],
        setEditedAutomationFilters: vi.fn(),
        storeFilters: false,
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
    mockUseAutomationAlertParameters.mockReturnValue({
        automationParameters: [],
        availableParameters: [],
        onParameterChange: vi.fn(),
        onParameterDelete: vi.fn(),
        onParameterAdd: vi.fn(),
        dropStaleParameters: vi.fn(),
    });
    mockUseAlertSupportedMetrics.mockReturnValue({
        measureFormatMap: {},
        supportedMeasures: [SENTINEL_MEASURE],
        supportedAttributes: [],
        isResultLoading: false,
        getAttributeValues: vi.fn(),
        getMetricValue: vi.fn(),
    });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AlertingDialog context-decorator slot", () => {
    it("seeds the state model from the decorated context, not just direct reads", () => {
        renderSeam(BASE_CONTEXT);

        expect(screen.getByTestId("direct-insight")).toHaveTextContent("decorated-insight");
        expect(screen.getByTestId("draft-channel")).toHaveTextContent(DECORATED_CHANNEL.id);
        expect(mockUseAlertSupportedMetrics).toHaveBeenLastCalledWith(
            expect.objectContaining({ insight: DECORATED_INSIGHT }),
        );
    });

    it("keeps the loading gate: a decorator that passes isLoading through seeds after the flip", () => {
        const { rerender } = renderSeam({ ...BASE_CONTEXT, isLoading: true });

        expect(screen.getByTestId("gate")).toHaveTextContent("LOADING");

        rerenderSeam(rerender, { ...BASE_CONTEXT, isLoading: false });

        expect(screen.getByTestId("draft-channel")).toHaveTextContent(DECORATED_CHANNEL.id);
    });

    it("is inert with the passthrough default: the state model seeds from the connector context", () => {
        resolvedDecorator = DefaultDialogContextDecorator;

        renderSeam({ ...ALERTING_DIALOG_CONTEXT, notificationChannels: [SENTINEL_CHANNEL] });

        expect(screen.getByTestId("direct-insight")).toHaveTextContent("NONE");
        expect(screen.getByTestId("draft-channel")).toHaveTextContent(SENTINEL_CHANNEL.id);
    });
});
