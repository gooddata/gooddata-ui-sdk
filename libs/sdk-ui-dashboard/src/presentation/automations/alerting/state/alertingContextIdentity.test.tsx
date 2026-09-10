// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IUser, idRef } from "@gooddata/sdk-model";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { AlertingDialogContextProvider } from "../../contexts/AlertingDialogContext.js";
import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../contexts/AutomationsContext.js";
import { type useValidateExistingAutomationFilters } from "../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js";
import {
    ALERTING_DIALOG_CONTEXT,
    AUTOMATIONS_CONTEXT,
    NEXT_FILTER,
    SENTINEL_MEASURE,
} from "../tests/alerting.test.helpers.js";
import { type AlertAttribute } from "../types.js";

import { useAlertActions } from "./AlertActionsContext.js";
import { useAlertData } from "./AlertDataContext.js";
import { useAlertDraft } from "./AlertDraftContext.js";
import { useAlertFilters } from "./AlertFiltersContext.js";
import { AlertingDialogStateProvider } from "./AlertingDialogStateProvider.js";
import {
    type IAlertActionsContextValue,
    type IAlertDataContextValue,
    type IAlertDraftContextValue,
    type IAlertFiltersContextValue,
} from "./types.js";
import { type useAlertSupportedMetrics } from "./useAlertSupportedMetrics.js";

// ---------------------------------------------------------------------------
// Two-direction identity proof for the four alert state contexts: a consumer-observed identity
// stays put across a rerender that moves nothing, and goes fresh the moment a real member changes.
// This is the regression net for `useShallowStable` replacing the hand-written `useMemo` dep
// arrays in `AlertingDialogStateProvider` — a missed dep in the old code could serve a stale
// member silently; a shallow-equal miss here cannot, because every member is compared.
//
// Same mocking rationale as `alertStateRenderCount.test.tsx`: only the two hooks unrelated to the
// members driven below are mocked, everything else (the four contexts' real aggregation) runs for
// real.
// ---------------------------------------------------------------------------

vi.hoisted(() => {
    vi.resetModules();
});

const { mockUseAlertSupportedMetrics, mockUseValidateExistingAutomationFilters } = vi.hoisted(() => ({
    mockUseAlertSupportedMetrics: vi.fn<typeof useAlertSupportedMetrics>(),
    mockUseValidateExistingAutomationFilters: vi.fn<typeof useValidateExistingAutomationFilters>(),
}));

vi.mock("./useAlertSupportedMetrics.js", () => ({
    useAlertSupportedMetrics: mockUseAlertSupportedMetrics,
}));

vi.mock("../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

// A different `currentUser` (a fresh reference, distinct login) — the only prop this suite ever
// varies across a rerender. It reaches `formState.defaultUser`/`defaultRecipient` (data context)
// and `onDestinationChange` (actions context, via its dependency array), so one prop change drives
// the fresh-direction proof for both without touching the draft or filters model at all.
const OTHER_USER: IUser = {
    ref: idRef("user-2"),
    login: "user2@example.com",
    email: "user2@example.com",
};
const OTHER_AUTOMATIONS_CONTEXT: IAutomationsContextValue = {
    ...AUTOMATIONS_CONTEXT,
    currentUser: OTHER_USER,
};

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

function Wrapper({
    children,
    automationsContext = AUTOMATIONS_CONTEXT,
}: PropsWithChildren<{ automationsContext?: IAutomationsContextValue }>) {
    return (
        <IntlWrapper>
            <AutomationsContextProvider value={automationsContext}>
                <AlertingDialogContextProvider value={ALERTING_DIALOG_CONTEXT}>
                    <AlertingDialogStateProvider>{children}</AlertingDialogStateProvider>
                </AlertingDialogContextProvider>
            </AutomationsContextProvider>
        </IntlWrapper>
    );
}

// ---------------------------------------------------------------------------
// Capture components: each calls exactly one context hook and forwards the observed value on
// every render, so a test can compare the value across renders by reference.
// ---------------------------------------------------------------------------

function DraftCapture({ onValue }: { onValue: (v: IAlertDraftContextValue) => void }) {
    onValue(useAlertDraft());
    return null;
}

function ActionsCapture({ onValue }: { onValue: (v: IAlertActionsContextValue) => void }) {
    onValue(useAlertActions());
    return null;
}

function DataCapture({ onValue }: { onValue: (v: IAlertDataContextValue) => void }) {
    onValue(useAlertData());
    return null;
}

function FiltersCapture({ onValue }: { onValue: (v: IAlertFiltersContextValue) => void }) {
    onValue(useAlertFilters());
    return null;
}

// Drivers: each fires one real member change through the actions/filters context, the same way a
// consumer would.

function TitleEditor() {
    const { onTitleChange } = useAlertActions();
    return (
        <button data-testid="edit-title" onClick={() => onTitleChange("changed-title")}>
            edit title
        </button>
    );
}

function FilterEditor() {
    const { onFiltersChange } = useAlertFilters();
    return (
        <button data-testid="edit-filter" onClick={() => onFiltersChange([NEXT_FILTER])}>
            edit filter
        </button>
    );
}

describe("alerting context identity — draft", () => {
    it("keeps the same object across a rerender that changes nothing", () => {
        const values: IAlertDraftContextValue[] = [];
        const onValue = (v: IAlertDraftContextValue) => values.push(v);

        const { rerender } = render(
            <Wrapper>
                <DraftCapture onValue={onValue} />
            </Wrapper>,
        );
        const first = values.at(-1)!;

        rerender(
            <Wrapper>
                <DraftCapture onValue={onValue} />
            </Wrapper>,
        );

        expect(values.at(-1)).toBe(first);
    });

    it("returns a fresh object when the draft title changes", () => {
        const values: IAlertDraftContextValue[] = [];
        const onValue = (v: IAlertDraftContextValue) => values.push(v);

        render(
            <Wrapper>
                <TitleEditor />
                <DraftCapture onValue={onValue} />
            </Wrapper>,
        );
        const first = values.at(-1)!;

        fireEvent.click(screen.getByTestId("edit-title"));

        expect(values.at(-1)).not.toBe(first);
        expect(values.at(-1)!.editedAutomation?.title).toBe("changed-title");
    });
});

describe("alerting context identity — actions", () => {
    it("keeps the same object across a rerender that changes nothing", () => {
        const values: IAlertActionsContextValue[] = [];
        const onValue = (v: IAlertActionsContextValue) => values.push(v);

        const { rerender } = render(
            <Wrapper>
                <ActionsCapture onValue={onValue} />
            </Wrapper>,
        );
        const first = values.at(-1)!;

        rerender(
            <Wrapper>
                <ActionsCapture onValue={onValue} />
            </Wrapper>,
        );

        expect(values.at(-1)).toBe(first);
    });

    it("returns a fresh object when the current user changes (onDestinationChange's identity moves)", () => {
        const values: IAlertActionsContextValue[] = [];
        const onValue = (v: IAlertActionsContextValue) => values.push(v);

        const { rerender } = render(
            <Wrapper>
                <ActionsCapture onValue={onValue} />
            </Wrapper>,
        );
        const first = values.at(-1)!;

        rerender(
            <Wrapper automationsContext={OTHER_AUTOMATIONS_CONTEXT}>
                <ActionsCapture onValue={onValue} />
            </Wrapper>,
        );

        expect(values.at(-1)).not.toBe(first);
        expect(values.at(-1)!.onDestinationChange).not.toBe(first.onDestinationChange);
    });
});

describe("alerting context identity — data", () => {
    it("keeps the same object across a rerender that changes nothing", () => {
        const values: IAlertDataContextValue[] = [];
        const onValue = (v: IAlertDataContextValue) => values.push(v);

        const { rerender } = render(
            <Wrapper>
                <DataCapture onValue={onValue} />
            </Wrapper>,
        );
        const first = values.at(-1)!;

        rerender(
            <Wrapper>
                <DataCapture onValue={onValue} />
            </Wrapper>,
        );

        expect(values.at(-1)).toBe(first);
    });

    it("returns a fresh object when the current user changes", () => {
        const values: IAlertDataContextValue[] = [];
        const onValue = (v: IAlertDataContextValue) => values.push(v);

        const { rerender } = render(
            <Wrapper>
                <DataCapture onValue={onValue} />
            </Wrapper>,
        );
        const first = values.at(-1)!;

        rerender(
            <Wrapper automationsContext={OTHER_AUTOMATIONS_CONTEXT}>
                <DataCapture onValue={onValue} />
            </Wrapper>,
        );

        expect(values.at(-1)).not.toBe(first);
        expect(values.at(-1)!.defaultUser.id).not.toBe(first.defaultUser.id);
    });
});

describe("alerting context identity — filters", () => {
    it("keeps the same object across a rerender that changes nothing", () => {
        const values: IAlertFiltersContextValue[] = [];
        const onValue = (v: IAlertFiltersContextValue) => values.push(v);

        const { rerender } = render(
            <Wrapper>
                <FiltersCapture onValue={onValue} />
            </Wrapper>,
        );
        const first = values.at(-1)!;

        rerender(
            <Wrapper>
                <FiltersCapture onValue={onValue} />
            </Wrapper>,
        );

        expect(values.at(-1)).toBe(first);
    });

    it("returns a fresh object when the filter selection changes", () => {
        const values: IAlertFiltersContextValue[] = [];
        const onValue = (v: IAlertFiltersContextValue) => values.push(v);

        render(
            <Wrapper>
                <FilterEditor />
                <FiltersCapture onValue={onValue} />
            </Wrapper>,
        );
        const first = values.at(-1)!;

        fireEvent.click(screen.getByTestId("edit-filter"));

        expect(values.at(-1)).not.toBe(first);
        expect(values.at(-1)!.selectedFilters).toEqual([NEXT_FILTER]);
    });
});
