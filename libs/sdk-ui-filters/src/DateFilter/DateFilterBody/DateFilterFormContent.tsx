// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type ReactNode, type RefObject, useCallback, useRef } from "react";

import { isEmpty } from "lodash-es";
import { useIntl } from "react-intl";

import {
    type DateFilterGranularity,
    type WeekStart,
    isAbsoluteDateFilterForm,
    isAllTimeDateFilterOption,
    isEmptyValuesDateFilterOption,
    isRelativeDateFilterForm,
} from "@gooddata/sdk-model";
import { useId } from "@gooddata/sdk-ui-kit";

import { AbsoluteDateFilterForm } from "../AbsoluteDateFilterForm/AbsoluteDateFilterForm.js";
import {
    createGranularityTabsKeyboardHandler,
    submitRelativeDateFilterForm,
} from "../accessibility/keyboardNavigation.js";
import { DateFilterFormWrapper } from "../DateFilterFormWrapper/DateFilterFormWrapper.js";
import { EmptyValuesHandlingToggle } from "../EmptyValuesHandlingToggle/EmptyValuesHandlingToggle.js";
import {
    type DateFilterOption,
    type IDateFilterOptionsByType,
    type IExtendedDateFilterErrors,
    type IUiAbsoluteDateFilterForm,
    type IUiRelativeDateFilterForm,
} from "../interfaces/index.js";
import { RelativeDateFilterForm } from "../RelativeDateFilterForm/RelativeDateFilterForm.js";

import { DateFilterFormNavigationWrapper } from "./DateFilterFormNavigationWrapper.js";
import { type DateFilterRoute } from "./types.js";

export interface IDateFilterFormContentProps {
    filterOptions: IDateFilterOptionsByType;
    selectedFilterOption: DateFilterOption;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;

    dateFormat: string;
    weekStart: WeekStart;
    isTimeForAbsoluteRangeEnabled: boolean;
    isSecondsForAbsoluteRangeEnabled?: boolean;
    isAbsoluteDateFilterGranularityEnabled: boolean;
    availableGranularities: DateFilterGranularity[];
    absoluteAvailableGranularities: DateFilterGranularity[];

    isMobile: boolean;
    withoutApply?: boolean;
    enableEmptyDateValues?: boolean;
    customRangeHint?: ReactNode;
    onPeriodRangeValidityChange?: (isValid: boolean) => void;

    activeForm: DateFilterRoute;
    onBackNavigation: () => void;
    onClose: () => void;

    submitForm: () => void;
    errors?: IExtendedDateFilterErrors;
}

/**
 * Builds the keydown handler bound to a granularity tabs container, shared by the absolute and relative
 * form's wrapper `<div>`s below - the only two consumers, hence a local hook rather than a shared export.
 */
function useGranularityTabsKeydownHandler(
    tabGranularityRef: RefObject<HTMLDivElement | null>,
    closeDropdown: () => void,
) {
    return useCallback(
        (event: KeyboardEvent) => {
            createGranularityTabsKeyboardHandler({ tabGranularityRef, closeDropdown })(event);
        },
        [tabGranularityRef, closeDropdown],
    );
}

/**
 * Component that renders the form content (absolute or relative) for date filter.
 * This component is purely presentational and doesn't manage any navigation state.
 *
 * @internal
 */
export function DateFilterFormContent({
    filterOptions,
    selectedFilterOption,
    onSelectedFilterOptionChange,
    dateFormat,
    weekStart,
    isTimeForAbsoluteRangeEnabled,
    isSecondsForAbsoluteRangeEnabled,
    isAbsoluteDateFilterGranularityEnabled,
    availableGranularities,
    absoluteAvailableGranularities,
    isMobile,
    withoutApply,
    enableEmptyDateValues,
    customRangeHint,
    onPeriodRangeValidityChange,
    activeForm,
    onBackNavigation,
    onClose,
    submitForm,
    errors,
}: IDateFilterFormContentProps) {
    const showStaticForm = activeForm === "absoluteForm" && filterOptions.absoluteForm;
    const showRelativeForm =
        activeForm === "relativeForm" && filterOptions.relativeForm && availableGranularities.length > 0;

    const absoluteSelectedFilterOption =
        filterOptions.absoluteForm && isAbsoluteDateFilterForm(selectedFilterOption)
            ? selectedFilterOption
            : filterOptions.absoluteForm;

    const relativeSelectedFilterOption =
        filterOptions.relativeForm && isRelativeDateFilterForm(selectedFilterOption)
            ? selectedFilterOption
            : filterOptions.relativeForm;

    const intl = useIntl();
    const tabGranularityRef = useRef<HTMLDivElement>(null);
    const absoluteTabGranularityRef = useRef<HTMLDivElement>(null);
    const relativeDateFilterId = useId();
    const absoluteDateFilterId = useId();

    const shouldRenderEmptyValuesHandling =
        !!enableEmptyDateValues &&
        !isAllTimeDateFilterOption(selectedFilterOption) &&
        !isEmptyValuesDateFilterOption(selectedFilterOption) &&
        selectedFilterOption.emptyValueHandling !== "only";
    const effectiveEmptyValueHandling = selectedFilterOption.emptyValueHandling ?? "exclude";
    const emptyValueHandlingToggleChecked = effectiveEmptyValueHandling === "include";

    const handleRelativeDateFilterKeydown = useGranularityTabsKeydownHandler(tabGranularityRef, onClose);
    const handleAbsoluteDateFilterKeydown = useGranularityTabsKeydownHandler(
        absoluteTabGranularityRef,
        onClose,
    );

    return (
        <div className="gd-date-filter-form-content">
            {showStaticForm ? (
                <DateFilterFormNavigationWrapper
                    title={
                        filterOptions.absoluteForm?.name
                            ? filterOptions.absoluteForm.name
                            : intl.formatMessage({ id: "filters.staticPeriod" })
                    }
                    onBack={onBackNavigation}
                    backLabel={intl.formatMessage({ id: "menu.back" })}
                    isMobile={isMobile}
                >
                    <div onKeyDown={handleAbsoluteDateFilterKeydown}>
                        <DateFilterFormWrapper isMobile={isMobile}>
                            <AbsoluteDateFilterForm
                                dateFormat={dateFormat}
                                onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                                selectedFilterOption={
                                    absoluteSelectedFilterOption as IUiAbsoluteDateFilterForm
                                }
                                isMobile={isMobile}
                                isTimeEnabled={isTimeForAbsoluteRangeEnabled}
                                isSecondsEnabled={isSecondsForAbsoluteRangeEnabled}
                                isGranularityEnabled={isAbsoluteDateFilterGranularityEnabled}
                                availableGranularities={absoluteAvailableGranularities}
                                accessibilityConfig={{ id: absoluteDateFilterId }}
                                weekStart={weekStart}
                                submitForm={submitForm}
                                withoutApply={withoutApply}
                                customRangeHint={customRangeHint}
                                onPeriodRangeValidityChange={onPeriodRangeValidityChange}
                                granularityTabsRef={absoluteTabGranularityRef}
                            />
                            {shouldRenderEmptyValuesHandling ? (
                                <EmptyValuesHandlingToggle
                                    mode="include"
                                    className="gd-date-filter-empty-values-handling-toggle"
                                    checked={emptyValueHandlingToggleChecked}
                                    onChange={(checked: boolean) => {
                                        const emptyValueHandling = checked ? "include" : undefined;
                                        onSelectedFilterOptionChange({
                                            ...absoluteSelectedFilterOption!,
                                            emptyValueHandling,
                                        });
                                    }}
                                />
                            ) : null}
                        </DateFilterFormWrapper>
                    </div>
                </DateFilterFormNavigationWrapper>
            ) : null}

            {showRelativeForm ? (
                <DateFilterFormNavigationWrapper
                    title={
                        filterOptions.relativeForm?.name
                            ? filterOptions.relativeForm.name
                            : intl.formatMessage({ id: "filters.floatingRange" })
                    }
                    onBack={onBackNavigation}
                    backLabel={intl.formatMessage({ id: "menu.back" })}
                    isMobile={isMobile}
                >
                    <div onKeyDown={handleRelativeDateFilterKeydown}>
                        <DateFilterFormWrapper isMobile={isMobile}>
                            <RelativeDateFilterForm
                                onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                                selectedFilterOption={
                                    relativeSelectedFilterOption as IUiRelativeDateFilterForm
                                }
                                availableGranularities={availableGranularities}
                                isMobile={isMobile}
                                ref={tabGranularityRef}
                                relativeDateFilterId={relativeDateFilterId}
                                onKeyDown={(event) =>
                                    submitRelativeDateFilterForm(
                                        event,
                                        isEmpty(errors),
                                        withoutApply ?? false,
                                        onClose,
                                        submitForm,
                                    )
                                }
                            />
                            {shouldRenderEmptyValuesHandling ? (
                                <EmptyValuesHandlingToggle
                                    mode="include"
                                    className="gd-date-filter-empty-values-handling-toggle"
                                    checked={emptyValueHandlingToggleChecked}
                                    onChange={(checked: boolean) => {
                                        const emptyValueHandling = checked ? "include" : undefined;
                                        onSelectedFilterOptionChange({
                                            ...relativeSelectedFilterOption!,
                                            emptyValueHandling,
                                        });
                                    }}
                                />
                            ) : null}
                        </DateFilterFormWrapper>
                    </div>
                </DateFilterFormNavigationWrapper>
            ) : null}
        </div>
    );
}
