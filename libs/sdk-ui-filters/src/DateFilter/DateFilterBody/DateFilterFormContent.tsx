// (C) 2025 GoodData Corporation

import { KeyboardEvent, useCallback, useRef } from "react";

import { isEmpty } from "lodash-es";
import { useIntl } from "react-intl";

import { DateFilterGranularity, WeekStart } from "@gooddata/sdk-model";
import { useId } from "@gooddata/sdk-ui-kit";

import { DateFilterFormNavigationWrapper } from "./DateFilterFormNavigationWrapper.js";
import { DateFilterRoute } from "./types.js";
import { AbsoluteDateFilterForm } from "../AbsoluteDateFilterForm/AbsoluteDateFilterForm.js";
import {
    createDateFilterRelativeFormKeyboardHandler,
    submitRelativeDateFilterForm,
} from "../accessibility/keyboardNavigation.js";
import { DateFilterFormWrapper } from "../DateFilterFormWrapper/DateFilterFormWrapper.js";
import {
    DateFilterOption,
    IDateFilterOptionsByType,
    IExtendedDateFilterErrors,
    IUiAbsoluteDateFilterForm,
    IUiRelativeDateFilterForm,
} from "../interfaces/index.js";
import { RelativeDateFilterForm } from "../RelativeDateFilterForm/RelativeDateFilterForm.js";

export interface IDateFilterFormContentProps {
    filterOptions: IDateFilterOptionsByType;
    selectedFilterOption: DateFilterOption;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;

    dateFormat: string;
    weekStart: WeekStart;
    isTimeForAbsoluteRangeEnabled: boolean;
    availableGranularities: DateFilterGranularity[];

    isMobile: boolean;
    withoutApply?: boolean;

    activeForm: DateFilterRoute;
    onBackNavigation: () => void;
    onClose: () => void;

    submitForm: () => void;
    errors: IExtendedDateFilterErrors;
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
    availableGranularities,
    isMobile,
    withoutApply,
    activeForm,
    onBackNavigation,
    onClose,
    submitForm,
    errors,
}: IDateFilterFormContentProps) {
    const showStaticForm = activeForm === "absoluteForm" && filterOptions.absoluteForm;
    const showRelativeForm =
        activeForm === "relativeForm" && filterOptions.relativeForm && availableGranularities.length > 0;
    const intl = useIntl();
    const relativeDateFilterRef = useRef<HTMLDivElement>(null);
    const tabGranularityRef = useRef<HTMLDivElement>(null);
    const relativeDateFilterId = useId();

    const handleRelativeDateFilterKeydown = useCallback(
        (event: KeyboardEvent, closeDropdown: () => void) => {
            const keyboardHandler = createDateFilterRelativeFormKeyboardHandler({
                relativeDateFilterRef,
                tabGranularityRef,
                closeDropdown,
            });
            keyboardHandler(event);
        },
        [relativeDateFilterRef, tabGranularityRef],
    );

    return (
        <div className="gd-date-filter-form-content">
            {showStaticForm ? (
                <DateFilterFormNavigationWrapper
                    title={
                        filterOptions.absoluteForm.name
                            ? filterOptions.absoluteForm.name
                            : intl.formatMessage({ id: "filters.staticPeriod" })
                    }
                    onBack={onBackNavigation}
                    backLabel={intl.formatMessage({ id: "menu.back" })}
                    isMobile={isMobile}
                >
                    <DateFilterFormWrapper isMobile={isMobile}>
                        <AbsoluteDateFilterForm
                            dateFormat={dateFormat}
                            onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                            selectedFilterOption={selectedFilterOption as IUiAbsoluteDateFilterForm}
                            isMobile={isMobile}
                            isTimeEnabled={isTimeForAbsoluteRangeEnabled}
                            weekStart={weekStart}
                            submitForm={submitForm}
                            withoutApply={withoutApply}
                        />
                    </DateFilterFormWrapper>
                </DateFilterFormNavigationWrapper>
            ) : null}

            {showRelativeForm ? (
                <DateFilterFormNavigationWrapper
                    title={
                        filterOptions.relativeForm.name
                            ? filterOptions.relativeForm.name
                            : intl.formatMessage({ id: "filters.floatingRange" })
                    }
                    onBack={onBackNavigation}
                    backLabel={intl.formatMessage({ id: "menu.back" })}
                    isMobile={isMobile}
                >
                    <div
                        ref={relativeDateFilterRef}
                        onKeyDown={(e) => handleRelativeDateFilterKeydown(e, onClose)}
                    >
                        <DateFilterFormWrapper isMobile={isMobile}>
                            <RelativeDateFilterForm
                                onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                                selectedFilterOption={selectedFilterOption as IUiRelativeDateFilterForm}
                                availableGranularities={availableGranularities}
                                isMobile={isMobile}
                                ref={tabGranularityRef}
                                relativeDateFilterId={relativeDateFilterId}
                                onKeyDown={(event) =>
                                    submitRelativeDateFilterForm(
                                        event,
                                        isEmpty(errors),
                                        withoutApply,
                                        onClose,
                                        submitForm,
                                    )
                                }
                            />
                        </DateFilterFormWrapper>
                    </div>
                </DateFilterFormNavigationWrapper>
            ) : null}
        </div>
    );
}
