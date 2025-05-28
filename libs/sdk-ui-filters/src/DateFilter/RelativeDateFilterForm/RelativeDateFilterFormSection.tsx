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
import { FormattedMessage } from "react-intl";
import { ListItemTooltip } from "../ListItemTooltip/ListItemTooltip.js";
import { DateFilterFormWrapper } from "../DateFilterFormWrapper/DateFilterFormWrapper.js";
import {
    createDateFilterRelativeFormKeyboardHandler,
    submitRelativeDateFilterForm,
} from "../accessibility/keyboardNavigation.js";
import { RelativeDateFilterForm } from "./RelativeDateFilterForm.js";
import { useId } from "@gooddata/sdk-ui-kit";
import isEmpty from "lodash/isEmpty.js";

const ITEM_CLASS_MOBILE = "gd-date-filter-item-mobile";

interface IAllTimeFilterSectionProps {
    filterOptions: IDateFilterOptionsByType;
    selectedFilterOption: DateFilterOption;
    isMobile: boolean;
    route: string;
    availableGranularities: DateFilterGranularity[];
    errors: IExtendedDateFilterErrors;
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
    onSelectedFilterOptionChange,
    changeRoute,
    closeDropdown,
    onApplyClick,
}) => {
    const relativeDateFilterRef = useRef<HTMLDivElement>(null);
    const tabGranularityRef = useRef<HTMLDivElement>(null);
    const relativeDateFilterId = useId();

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

    return (
        <>
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
                        <ListItemTooltip bubbleAlignPoints={[{ align: "cr cl" }]}>
                            <FormattedMessage id="filters.floatingRange.tooltip" />
                        </ListItemTooltip>
                    ) : null}
                </ListItem>
            ) : null}

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
