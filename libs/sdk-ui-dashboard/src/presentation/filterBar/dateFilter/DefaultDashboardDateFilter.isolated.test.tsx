// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IDashboardDateFilter } from "@gooddata/sdk-model";
import {
    type IDateFilterProps,
    type IUiAbsoluteGranularityDateFilterForm,
    type IUiRelativeDateFilterForm,
} from "@gooddata/sdk-ui-filters";

import { type IDashboardDateFilterConfig, type IDefaultDashboardDateFilterProps } from "./types.js";

const { capturedDateFilterProps } = vi.hoisted(() => ({
    capturedDateFilterProps: { current: undefined as IDateFilterProps | undefined },
}));

vi.mock("@gooddata/sdk-ui-filters", async (importOriginal) => {
    const original = await importOriginal<Record<string, unknown>>();
    return {
        ...original,
        DateFilter: (props: IDateFilterProps) => {
            capturedDateFilterProps.current = props;
            return null;
        },
    };
});

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => selectorValues().get(selector),
}));

vi.mock("../../dragAndDrop/useCurrentDateFilterConfig.js", () => ({
    useCurrentDateFilterConfig: () => ({ title: "Date", mode: "active" }),
}));

const { selectBackendCapabilities } =
    await import("../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js");
const { selectCatalogDateDatasets } = await import("../../../model/store/catalog/catalogSelectors.js");
const {
    selectActiveCalendars,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
    selectLocale,
    selectSettings,
    selectWeekStart,
} = await import("../../../model/store/config/configSelectors.js");
const { selectIsInEditMode } = await import("../../../model/store/renderMode/renderModeSelectors.js");
const { DefaultDashboardDateFilter } = await import("./DefaultDashboardDateFilter.js");

function selectorValues(): Map<unknown, unknown> {
    return new Map<unknown, unknown>([
        [selectSettings, { enableAbsoluteDateFilterGranularity: true }],
        [selectBackendCapabilities, {}],
        [selectLocale, "en-US"],
        [selectIsInEditMode, false],
        [selectWeekStart, "Sunday"],
        [selectIsApplyFiltersAllAtOnceEnabledAndSet, false],
        [selectActiveCalendars, undefined],
        [selectCatalogDateDatasets, []],
    ]);
}

const config: IDashboardDateFilterConfig = {
    availableGranularities: ["GDC.time.month", "GDC.time.year"],
    dateFilterOptions: {
        absoluteForm: {
            localIdentifier: "ABSOLUTE_FORM",
            type: "absoluteForm",
            name: "",
            visible: true,
        },
        relativeForm: {
            localIdentifier: "RELATIVE_FORM",
            type: "relativeForm",
            name: "",
            visible: true,
        },
    },
};

const monthsOption: IUiAbsoluteGranularityDateFilterForm = {
    localIdentifier: "ABSOLUTE_FORM",
    type: "absoluteGranularityForm",
    name: "",
    visible: true,
    granularity: "GDC.time.month",
    from: "2026-01",
    to: "2026-03",
};

const lastYearOption: IUiRelativeDateFilterForm = {
    localIdentifier: "RELATIVE_FORM",
    type: "relativeForm",
    name: "",
    visible: true,
    granularity: "GDC.time.year",
    from: -1,
    to: -1,
};

function renderDateFilter(props: Partial<IDefaultDashboardDateFilterProps>) {
    return render(
        <IntlProvider locale="en-US" messages={{}} onError={() => {}}>
            <DefaultDashboardDateFilter
                {...({
                    filter: undefined,
                    workingFilter: undefined,
                    config,
                    ...props,
                } as IDefaultDashboardDateFilterProps)}
            />
        </IntlProvider>,
    );
}

describe("DefaultDashboardDateFilter", () => {
    beforeEach(() => {
        capturedDateFilterProps.current = undefined;
    });

    describe("with whole periods enabled", () => {
        it("offers whole periods and propagates them", () => {
            const onFilterChanged = vi.fn();
            renderDateFilter({ onFilterChanged, isAbsoluteDateFilterGranularityEnabled: true });

            expect(capturedDateFilterProps.current?.isAbsoluteDateFilterGranularityEnabled).toBe(true);
            capturedDateFilterProps.current?.onApply?.(monthsOption, false);

            expect(onFilterChanged).toHaveBeenCalledWith(
                expect.objectContaining({
                    dashboardAbsoluteGranularityDateFilter: expect.objectContaining({
                        granularity: "GDC.time.month",
                        from: "2026-01",
                        to: "2026-03",
                    }),
                }),
                "ABSOLUTE_FORM",
                undefined,
            );
        });

        it("keeps the local identifier of the filter", () => {
            const onFilterChanged = vi.fn();
            renderDateFilter({
                filter: {
                    dashboardAbsoluteGranularityDateFilter: {
                        granularity: "GDC.time.year",
                        from: "2025",
                        localIdentifier: "date",
                    },
                },
                workingFilter: undefined,
                onFilterChanged,
                isAbsoluteDateFilterGranularityEnabled: true,
            });

            capturedDateFilterProps.current?.onApply?.(lastYearOption, false);

            expect(onFilterChanged).toHaveBeenCalledWith(
                expect.objectContaining({
                    dateFilter: expect.objectContaining({ type: "relative", localIdentifier: "date" }),
                }),
                "RELATIVE_FORM",
                undefined,
            );
        });
    });

    describe("without whole periods enabled", () => {
        it("does not offer whole periods", () => {
            renderDateFilter({ onFilterChanged: vi.fn() });

            expect(capturedDateFilterProps.current?.isAbsoluteDateFilterGranularityEnabled).toBe(false);
        });

        it("is not called with whole periods", () => {
            const onFilterChanged = vi.fn();
            renderDateFilter({ onFilterChanged });

            capturedDateFilterProps.current?.onApply?.(monthsOption, false);

            expect(onFilterChanged).not.toHaveBeenCalled();
        });

        it("is called with the old type", () => {
            const onFilterChanged = vi.fn<(filter: IDashboardDateFilter | undefined) => void>();
            renderDateFilter({ onFilterChanged });

            capturedDateFilterProps.current?.onApply?.(lastYearOption, false);

            expect(onFilterChanged).toHaveBeenCalledWith(
                expect.objectContaining({
                    dateFilter: expect.objectContaining({
                        type: "relative",
                        granularity: "GDC.time.year",
                        from: -1,
                        to: -1,
                    }),
                }),
                "RELATIVE_FORM",
                undefined,
            );
        });
    });
});
