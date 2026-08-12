// (C) 2026 GoodData Corporation

import { createContext, useContext, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type DateFilterGranularity, type IDashboardDateFilter } from "@gooddata/sdk-model";
import {
    DateFilter,
    type DateFilterOption,
    type IDateFilterButtonProps,
    type IDateFilterOptionInfo,
    type IDateFilterOptionsByType,
    type IUiAbsoluteDateFilterForm,
    excludeCurrentPeriodFromRange,
    matchDateFilterToDateFilterOptionWithPreference,
} from "@gooddata/sdk-ui-filters";
import { DropdownButton } from "@gooddata/sdk-ui-kit";
import {
    type ConditionalFormattingValue,
    allowedValueGranularities,
    snapPlatformRangeToPeriodBounds,
    snapToPeriodBounds,
    usesTimeResolution,
} from "@gooddata/sdk-ui-pivot/next";

import { conditionalFormattingMessages } from "../../../../locales.js";

import { type ICfFieldProps } from "./cfFieldProps.js";
import { type ICfDateMeta, type ICfDateSettings } from "./conditionalFormattingModel.js";

const ABSOLUTE_FORM_ID = "ABSOLUTE_FORM";

type RelativePresetsByGranularity = NonNullable<IDateFilterOptionsByType["relativePreset"]>;
type RelativePresetList = Array<NonNullable<RelativePresetsByGranularity[DateFilterGranularity]>[number]>;

/**
 * The workspace catalog scoped down to what the column's granularity can honor (granularity
 * applicability is column-driven; the preset catalog is workspace-shared). The "All time" and
 * empty-values entries never show — the All time and Is empty operators cover those.
 */
function scopeCatalogToColumn(
    catalog: IDateFilterOptionsByType | undefined,
    absoluteForm: IUiAbsoluteDateFilterForm,
    granularity: DateFilterGranularity,
): IDateFilterOptionsByType {
    const allowed = allowedValueGranularities(granularity);
    const relativePresetEntries = Object.entries(catalog?.relativePreset ?? {}).flatMap(
        ([presetGranularity, presets]): Array<[string, RelativePresetList]> => {
            if (!allowed.some((candidate) => candidate === presetGranularity)) {
                return [];
            }
            // Bounded ("… to date") presets are not offered: the stored value cannot carry the
            // bound, so applying one would silently persist the whole unbounded period.
            const offerable = (presets ?? []).filter((preset) => preset.boundedFilter === undefined);
            return offerable.length > 0 ? [[presetGranularity, offerable]] : [];
        },
    );
    return {
        absoluteForm,
        ...(catalog?.relativeForm ? { relativeForm: catalog.relativeForm } : {}),
        ...(catalog?.absolutePreset ? { absolutePreset: catalog.absolutePreset } : {}),
        ...(relativePresetEntries.length > 0
            ? { relativePreset: Object.fromEntries(relativePresetEntries) }
            : {}),
    };
}

// The stored condition value expressed as the dashboard filter shape the option matcher speaks.
function toDashboardDateFilter(
    value: ConditionalFormattingValue,
    columnGranularity: DateFilterGranularity,
): IDashboardDateFilter | undefined {
    if (value.kind === "absoluteDate") {
        return {
            dateFilter: {
                type: "absolute",
                granularity: columnGranularity,
                from: value.from,
                to: value.to,
            },
        };
    }
    if (value.kind === "relativeDate") {
        return {
            dateFilter: {
                type: "relative",
                granularity: value.granularity,
                from: value.from,
                to: value.to,
            },
        };
    }
    return undefined;
}

// The option (and reconstructed exclude-toggle state) the picker opens on for a stored value.
function matchStoredValue(
    value: ConditionalFormattingValue,
    absoluteForm: IUiAbsoluteDateFilterForm,
    filterOptions: IDateFilterOptionsByType,
    granularity: DateFilterGranularity,
): IDateFilterOptionInfo {
    const storedFilter = toDashboardDateFilter(value, granularity);
    if (!storedFilter) {
        return { dateFilterOption: absoluteForm, excludeCurrentPeriod: false };
    }
    return matchDateFilterToDateFilterOptionWithPreference(storedFilter, filterOptions, undefined);
}

// DateFilter's button contract is fixed, so the error state travels via context.
const CfDateButtonA11yContext = createContext<{ describedBy?: string; hasError?: boolean }>({});

// Rendered through DateFilter's button slot. Module-level so its identity is stable across renders.
// Deliberately NOT wiring props.onClick: DateFilterCore's wrapping span already toggles the dropdown,
// so wiring both toggles it twice per click (open → instantly closed).
function CfDateButton({
    customFilterName,
    textSubtitle,
    isOpen,
    buttonRef,
    dropdownId,
}: IDateFilterButtonProps) {
    const { describedBy, hasError } = useContext(CfDateButtonA11yContext);
    return (
        <DropdownButton
            className={cx("gd-cf-date-value", { "gd-cf-date-value--error": hasError })}
            value={customFilterName ?? textSubtitle}
            isOpen={isOpen}
            isFullWidth
            buttonRef={buttonRef}
            dropdownId={dropdownId}
            accessibilityConfig={describedBy ? { ariaDescribedBy: describedBy } : undefined}
        />
    );
}

export interface ICfDateValueDropdownProps extends ICfFieldProps {
    value: ConditionalFormattingValue;
    date: ICfDateMeta;
    /** Workspace preset catalog (shared with the dashboard date filter); undefined = static only. */
    catalogOptions?: IDateFilterOptionsByType;
    /** Workspace date-display settings (format, week start). */
    dateSettings?: ICfDateSettings;
    onChange: (value: ConditionalFormattingValue) => void;
}

/**
 * The value picker of a date condition: the standard DateFilter embedded with a dialog-styled
 * trigger. Offers the static period form plus the workspace preset catalog and relative form,
 * scoped to the target column's granularity.
 *
 * Exclude-current-period follows the dashboard's persistence exactly: the stored offsets are the
 * already-shifted range (no flag), and reopening reconstructs the preset + checked toggle by
 * matching the stored range against "preset shifted by one".
 */
export function CfDateValueDropdown({
    value,
    date,
    catalogOptions,
    dateSettings,
    hasError,
    errorId,
    onChange,
    onVisit,
}: ICfDateValueDropdownProps) {
    const intl = useIntl();
    const stored = value.kind === "absoluteDate" ? { from: value.from, to: value.to } : undefined;
    // The static form needs bounds to open on; pin the current period at mount (recomputing "now"
    // every render would tick across minute boundaries and reset in-progress state). A granularity
    // change while mounted keeps the stale template — harmless, applying always snaps against current.
    const [pristineTemplate] = useState(() => snapToPeriodBounds(new Date(), new Date(), date.granularity));
    const template = stored ?? pristineTemplate ?? undefined;
    const absoluteForm: IUiAbsoluteDateFilterForm = {
        localIdentifier: ABSOLUTE_FORM_ID,
        type: "absoluteForm",
        name: "",
        visible: true,
        from: template?.from,
        to: template?.to,
    };
    const filterOptions = scopeCatalogToColumn(catalogOptions, absoluteForm, date.granularity);
    const matched = matchStoredValue(value, absoluteForm, filterOptions, date.granularity);

    const handleApply = (option: DateFilterOption, excludeCurrentPeriod: boolean) => {
        if (option.type === "absoluteForm" || option.type === "absolutePreset") {
            if (option.from === undefined || option.to === undefined) {
                return;
            }
            // Store the range as picked (overlap semantics resolve it against any column
            // granularity per render); snapping at the value's own precision only validates and
            // normalizes ordering.
            const from = String(option.from);
            const to = String(option.to);
            const precision = from.length > 10 || to.length > 10 ? "GDC.time.minute" : "GDC.time.date";
            const snapped = snapPlatformRangeToPeriodBounds(from, to, precision);
            if (snapped) {
                onChange({ kind: "absoluteDate", from: snapped.from, to: snapped.to });
            }
            return;
        }
        if (option.type === "relativeForm" || option.type === "relativePreset") {
            const { granularity, from, to } = option;
            if (granularity === undefined || from === undefined || to === undefined) {
                return;
            }
            // Bake exclude-current-period into the offsets (dashboard parity): the shared helper
            // shifts a current-period-ending range back by one, exactly what the filter bar persists.
            const range = excludeCurrentPeriodFromRange({ from, to }, excludeCurrentPeriod);
            onChange({ kind: "relativeDate", granularity, from: range.from, to: range.to });
        }
        // allTime/emptyValues never appear among the options (the All time / Is empty operators cover them).
    };

    return (
        <CfDateButtonA11yContext.Provider value={{ describedBy: errorId, hasError }}>
            <DateFilter
                dateFilterMode="active"
                filterOptions={filterOptions}
                availableGranularities={
                    filterOptions.relativeForm ? [...allowedValueGranularities(date.granularity)] : []
                }
                selectedFilterOption={matched.dateFilterOption}
                excludeCurrentPeriod={matched.excludeCurrentPeriod}
                isTimeForAbsoluteRangeEnabled={usesTimeResolution(date.granularity)}
                dateFormat={dateSettings?.dateFormat}
                // Week columns pin Monday: the resolver snaps ISO weeks, and a Sunday-start calendar
                // would let a selection straddle the snap boundary.
                weekStart={date.granularity === "GDC.time.week_us" ? "Monday" : dateSettings?.weekStart}
                locale={intl.locale}
                onApply={handleApply}
                // Every close counts as a visit, applied or not. Blur can't serve as that signal: opening
                // the picker moves focus into its own overlay.
                onClose={onVisit}
                overlayPositionType="sameAsTarget"
                ButtonComponent={CfDateButton}
                customFilterName={
                    value.kind === "none"
                        ? intl.formatMessage(conditionalFormattingMessages.dialogSelectPeriod)
                        : undefined
                }
            />
        </CfDateButtonA11yContext.Provider>
    );
}
