// (C) 2025 GoodData Corporation

import { MouseEvent, RefObject, useCallback } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { DateFilterGranularity } from "@gooddata/sdk-model";
import { Button } from "@gooddata/sdk-ui-kit";

import { DATE_FILTER_CUSTOM_RELATIVE_ID, DATE_FILTER_CUSTOM_STATIC_ID } from "../accessibility/elementId.js";
import { DateFilterOption, IDateFilterOptionsByType } from "../interfaces/index.js";

export interface IDateFilterCustomPeriodButtonsProps {
    filterOptions: IDateFilterOptionsByType;
    selectedFilterOption: DateFilterOption;
    availableGranularities: DateFilterGranularity[];

    onStaticButtonClick: () => void;
    onRelativeButtonClick: () => void;

    /** Ref for the absolute/static form button - used for focus management */
    absoluteButtonRef?: RefObject<HTMLButtonElement>;
    /** Ref for the relative form button - used for focus management */
    relativeButtonRef?: RefObject<HTMLButtonElement>;

    absoluteFormId?: string;
    relativeFormId?: string;
}

/**
 * Component that renders the static and relative form buttons for date filter.
 * This component is purely presentational and doesn't manage any state.
 *
 * @internal
 */
export function DateFilterCustomPeriodButtons({
    filterOptions,
    selectedFilterOption,
    availableGranularities,
    onStaticButtonClick,
    onRelativeButtonClick,
    absoluteButtonRef,
    relativeButtonRef,
    absoluteFormId,
    relativeFormId,
}: IDateFilterCustomPeriodButtonsProps) {
    const onStaticButtonClickHandler = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            onStaticButtonClick();
        },
        [onStaticButtonClick],
    );
    const onRelativeButtonClickHandler = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            onRelativeButtonClick();
        },
        [onRelativeButtonClick],
    );

    return (
        <div className="gd-date-filter-form-buttons">
            <div className="gd-date-filter-form-buttons-container">
                {filterOptions.absoluteForm ? (
                    <Button
                        id={DATE_FILTER_CUSTOM_STATIC_ID}
                        ref={absoluteButtonRef}
                        className={cx(
                            "gd-date-filter-form-button",
                            "gd-list-item",
                            "gd-menu-item",
                            "is-submenu",
                            "s-absolute-form-button",
                            {
                                "is-selected":
                                    selectedFilterOption.localIdentifier ===
                                    filterOptions.absoluteForm.localIdentifier,
                            },
                        )}
                        onClick={onStaticButtonClickHandler}
                        value={
                            filterOptions.absoluteForm.name ? (
                                filterOptions.absoluteForm.name
                            ) : (
                                <FormattedMessage id="filters.staticPeriod" />
                            )
                        }
                        accessibilityConfig={{
                            popupType: "dialog",
                            ariaControls: absoluteFormId,
                            ariaExpanded: false,
                            ariaCurrent:
                                selectedFilterOption.localIdentifier ===
                                filterOptions.absoluteForm.localIdentifier,
                        }}
                    />
                ) : null}

                {filterOptions.relativeForm && availableGranularities.length > 0 ? (
                    <Button
                        id={DATE_FILTER_CUSTOM_RELATIVE_ID}
                        ref={relativeButtonRef}
                        className={cx(
                            "gd-date-filter-form-button",
                            "gd-list-item",
                            "gd-menu-item",
                            "is-submenu",
                            "s-relative-form-button",
                            {
                                "is-selected":
                                    selectedFilterOption.localIdentifier ===
                                    filterOptions.relativeForm.localIdentifier,
                            },
                        )}
                        onClick={onRelativeButtonClickHandler}
                        value={
                            filterOptions.relativeForm.name ? (
                                filterOptions.relativeForm.name
                            ) : (
                                <FormattedMessage id="filters.floatingRange" />
                            )
                        }
                        accessibilityConfig={{
                            popupType: "dialog",
                            ariaExpanded: false,
                            ariaControls: relativeFormId,
                            ariaCurrent:
                                selectedFilterOption.localIdentifier ===
                                filterOptions.relativeForm.localIdentifier,
                        }}
                    />
                ) : null}
            </div>
        </div>
    );
}
