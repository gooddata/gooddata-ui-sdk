// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { AlertingDialogContextProvider } from "../../contexts/AlertingDialogContext.js";
import { AutomationsContextProvider } from "../../contexts/AutomationsContext.js";
import { setAlertExecutionParameters } from "../../shared/automationFilters/automationParameters.js";
import { type AlertAttribute } from "../types.js";

import { useAlertActions } from "./AlertActionsContext.js";
import { useAlertFilters } from "./AlertFiltersContext.js";
import { AlertingDialogStateProvider } from "./AlertingDialogStateProvider.js";
import {
    ALERTING_DIALOG_CONTEXT,
    AUTOMATIONS_CONTEXT,
    NEXT_FILTER,
    PARAMETER_REF,
    SENTINEL_MEASURE,
} from "./fixtures.js";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()).
//
// Only the two hooks unrelated to filter/parameter propagation are mocked: `useAlertSupportedMetrics`
// resolves measures from an execution result, and `useValidateExistingAutomationFilters` computes
// staleness against the dashboard's current filters — neither one is read by the assertions below.
// `useAutomationsContext` and `useAlertingDialogContext` are supplied by their real providers, and
// every other hook the state provider composes (`useAutomationFiltersSelect`, `useAlertFormState`,
// `useAlertFiltersModel`, `useAutomationAlertParameters`) runs for real: the whole point of this file
// is that a second call site reading through the accessor sees the same state a mutator wrote, and a
// mock standing in for any of those hooks would settle exactly the question being asked.
// ---------------------------------------------------------------------------

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

const { mockUseAlertSupportedMetrics, mockUseValidateExistingAutomationFilters } = vi.hoisted(() => ({
    mockUseAlertSupportedMetrics: vi.fn(),
    mockUseValidateExistingAutomationFilters: vi.fn(),
}));

vi.mock("./useAlertSupportedMetrics.js", () => ({
    useAlertSupportedMetrics: mockUseAlertSupportedMetrics,
}));

vi.mock("../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

beforeEach(() => {
    vi.clearAllMocks();

    mockUseAlertSupportedMetrics.mockReturnValue({
        measureFormatMap: {},
        supportedMeasures: [SENTINEL_MEASURE],
        supportedAttributes: [] as AlertAttribute[],
        isResultLoading: false,
        getAttributeValues: vi.fn(),
        getMetricValue: vi.fn(),
    });

    mockUseValidateExistingAutomationFilters.mockReturnValue({
        isValid: true,
        hiddenFilterIsMissingInSavedFilters: false,
        hiddenFilterHasDifferentValueInSavedFilter: false,
        lockedFilterIsMissingInSavedFilters: false,
        lockedFilterHasDifferentValueInSavedFilter: false,
        ignoredFilterIsAppliedInSavedFilters: false,
        removedFilterIsAppliedInSavedFilters: false,
        commonDateFilterIsMissingInSavedVisibleFilters: false,
        visibleFilterIsMissingInSavedFilters: false,
        visibleFiltersAreMissing: false,
        incompatibleSelectionTypeIsAppliedInSavedFilters: false,
        filtersAreStale: false,
    });
});

// ---------------------------------------------------------------------------
// The fake customer shell — two sibling blocks reading and writing through the same accessors a
// real replacement slot would use, mounted under the real `AlertingDialogStateProvider`.
// ---------------------------------------------------------------------------

function Wrapper({ children }: PropsWithChildren) {
    return (
        <IntlWrapper>
            <AutomationsContextProvider value={AUTOMATIONS_CONTEXT}>
                <AlertingDialogContextProvider value={ALERTING_DIALOG_CONTEXT}>
                    <AlertingDialogStateProvider>{children}</AlertingDialogStateProvider>
                </AlertingDialogContextProvider>
            </AutomationsContextProvider>
        </IntlWrapper>
    );
}

function BlockA() {
    const { onFiltersChange } = useAlertFilters();
    const { setEditedAutomation } = useAlertActions();
    return (
        <>
            <button data-testid="block-a-change-filters" onClick={() => onFiltersChange([NEXT_FILTER])}>
                change filters
            </button>
            <button
                data-testid="block-a-write-parameters"
                onClick={() =>
                    setEditedAutomation((current) =>
                        current
                            ? setAlertExecutionParameters(current, [
                                  { ref: PARAMETER_REF, value: "override-value" },
                              ])
                            : current,
                    )
                }
            >
                write parameters
            </button>
        </>
    );
}

function BlockB() {
    const { selectedFilters, automationParameters } = useAlertFilters();
    return (
        <>
            <div data-testid="block-b-filter-count">{selectedFilters.length}</div>
            <div data-testid="block-b-parameter-value">
                {String(automationParameters[0]?.value ?? "NONE")}
            </div>
        </>
    );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("alert state acceptance — a second call site sees what the mutator wrote", () => {
    it("propagates a filter selection block A wrote to block B, both reading useAlertFilters()", () => {
        render(
            <Wrapper>
                <BlockA />
                <BlockB />
            </Wrapper>,
        );

        expect(screen.getByTestId("block-b-filter-count")).toHaveTextContent("0");

        fireEvent.click(screen.getByTestId("block-a-change-filters"));

        expect(screen.getByTestId("block-b-filter-count")).toHaveTextContent("1");
    });

    it("propagates an execution parameter written via useAlertActions().setEditedAutomation into useAlertFilters().automationParameters", () => {
        render(
            <Wrapper>
                <BlockA />
                <BlockB />
            </Wrapper>,
        );

        expect(screen.getByTestId("block-b-parameter-value")).toHaveTextContent("NONE");

        fireEvent.click(screen.getByTestId("block-a-write-parameters"));

        expect(screen.getByTestId("block-b-parameter-value")).toHaveTextContent("override-value");
    });
});
