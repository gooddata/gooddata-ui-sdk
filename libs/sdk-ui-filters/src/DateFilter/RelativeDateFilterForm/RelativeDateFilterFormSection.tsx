// (C) 2025 GoodData Corporation
import React, { useCallback, useRef } from "react";
import cx from "classnames";
import {
    DateFilterOption,
    IDateFilterOptionsByType,
    IExtendedDateFilterErrors,
    IUiRelativeDateFilterForm,
} from "../interfaces/index.js";
import { DateFilterRoute } from "../DateFilterBody/types.js";
import { DateFilterGranularity, isRelativeDateFilterForm } from "@gooddata/sdk-model";
import { ListItem } from "../ListItem/ListItem.js";
import { FormattedMessage, useIntl } from "react-intl";
import { DateFilterFormWrapper } from "../DateFilterFormWrapper/DateFilterFormWrapper.js";
import {
    createDateFilterRelativeFormKeyboardHandler,
    submitRelativeDateFilterForm,
} from "../accessibility/keyboardNavigation.js";
import { RelativeDateFilterForm } from "./RelativeDateFilterForm.js";
import { UiIconButton, UiTooltip, useId } from "@gooddata/sdk-ui-kit";
import isEmpty from "lodash/isEmpty.js";

const ITEM_CLASS_MOBILE = "gd-date-filter-item-mobile";

interface IAllTimeFilterSectionProps {
    filterOptions: IDateFilterOptionsByType;
    selectedFilterOption: DateFilterOption;
    isMobile: boolean;
    route: string;
    availableGranularities: DateFilterGranularity[];
    errors: IExtendedDateFilterErrors;
    withoutApply?: boolean;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
    changeRoute: (newRoute?: DateFilterRoute) => void;
    closeDropdown: () => void;
    onApplyClick: () => void;
}

export const RelativeDateFilterFormSection: React.FC<IAllTimeFilterSectionProps> = ({
    filterOptions,
    selectedFilterOption,
    isMobile,
    route,
    availableGranularities,
    errors,
    withoutApply,
    onSelectedFilterOptionChange,
    changeRoute,
    closeDropdown,
    onApplyClick,
}) => {
    const intl = useIntl();
    const relativeDateFilterRef = useRef<HTMLDivElement>(null);
    const tabGranularityRef = useRef<HTMLDivElement>(null);
    const relatideDateFilterItem = useRef<HTMLDivElement>(null);
    const relativeDateFilterId = useId();
    const relativeDateFilterTooltipId = `relative-date-filter-tooltip-${relativeDateFilterId}`;

    const handleRelativeDateFilterKeydown = useCallback(
        (event: React.KeyboardEvent, closeDropdown: () => void) => {
            const keyboardHandler = createDateFilterRelativeFormKeyboardHandler({
                relativeDateFilterRef,
                tabGranularityRef,
                closeDropdown,
            });
            keyboardHandler(event);
        },
        [relativeDateFilterRef, tabGranularityRef],
    );

    if (!filterOptions.relativeForm) {
        return null;
    }

    const isSelected = filterOptions.relativeForm.localIdentifier === selectedFilterOption.localIdentifier;
    const isOnRoute = route === "relativeForm";

    // Handles keyboard navigation between Relative item and question mark tooltip.
    const handleOnKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            event.stopPropagation();

            const focusableElementsSelector = 'button:not(:disabled):not([aria-disabled="true"])';
            const focusableElements =
                relatideDateFilterItem.current?.querySelectorAll<HTMLElement>(focusableElementsSelector) ??
                [];

            const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as HTMLElement);
            const nextElement =
                currentIndex === focusableElements.length - 1
                    ? focusableElements[0]
                    : focusableElements[currentIndex + 1];
            (nextElement as HTMLElement)?.focus();
        }
    };

    return (
        <>
            <div
                className="gd-relative-form-section s-relative-form-section"
                ref={relatideDateFilterItem}
                onKeyDown={handleOnKeyDown}
            >
                {!isMobile || !isOnRoute ? (
                    <ListItem
                        isSelected={isSelected}
                        onClick={() => {
                            changeRoute("relativeForm");
                            if (!isRelativeDateFilterForm(selectedFilterOption)) {
                                onSelectedFilterOptionChange(filterOptions.relativeForm);
                            }
                        }}
                        className={cx(
                            "s-relative-form",
                            "s-do-not-close-dropdown-on-click",
                            isMobile && ITEM_CLASS_MOBILE,
                        )}
                    >
                        {filterOptions.relativeForm.name ? (
                            filterOptions.relativeForm.name
                        ) : (
                            <FormattedMessage id="filters.floatingRange" />
                        )}
                        {!isMobile ? (
                            <UiTooltip
                                id={relativeDateFilterTooltipId}
                                width={300}
                                arrowPlacement="left"
                                content={<FormattedMessage id="filters.floatingRange.tooltip" />}
                                anchor={
                                    <UiIconButton
                                        icon="question"
                                        variant="tertiary"
                                        size="xsmall"
                                        accessibilityConfig={{
                                            ariaLabel: intl.formatMessage({
                                                id: "filters.floatingRange.tooltip.ariaLabel",
                                            }),
                                            ariaDescribedBy: relativeDateFilterTooltipId,
                                        }}
                                    />
                                }
                                triggerBy={["hover", "focus"]}
                            />
                        ) : null}
                    </ListItem>
                ) : null}
            </div>

            {isSelected && (!isMobile || isOnRoute) ? (
                <DateFilterFormWrapper isMobile={isMobile}>
                    <div
                        ref={relativeDateFilterRef}
                        onKeyDown={(e) => handleRelativeDateFilterKeydown(e, closeDropdown)}
                    >
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
                                    closeDropdown,
                                    onApplyClick,
                                )
                            }
                        />
                    </div>
                </DateFilterFormWrapper>
            ) : null}
        </>
    );
};
