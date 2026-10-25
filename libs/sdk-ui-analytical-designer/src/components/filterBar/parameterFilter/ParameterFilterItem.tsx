// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import classNames from "classnames";
import { useIntl } from "react-intl";
import { useDispatch } from "react-redux";

import { type ParameterValue, isValidParameterValue } from "@gooddata/sdk-model";
import { Overlay, ParameterControl, ParameterControlButton } from "@gooddata/sdk-ui-kit";

import { updateParameterFilter } from "../../../store/filter_bar/parameter_filter_actions.js";
import { type IParameterFilter } from "../../../store/filter_bar/parameter_filter_types.js";
import { type AppDispatch } from "../../../store/types.js";
import { DROPDOWN_ALIGNMENTS } from "../../../utils/dropdown.js";
import { FilterItem } from "../FilterItem.js";

export interface IParameterFilterItemOwnProps {
    filter: IParameterFilter;
    className?: string;
    isHighlighted?: boolean;
}

export function ParameterFilterItem({ filter, className, isHighlighted }: IParameterFilterItemOwnProps) {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();
    const onUpdate = useCallback(
        (updatedFilter: IParameterFilter) => {
            dispatch(updateParameterFilter(updatedFilter));
        },
        [dispatch],
    );

    const [isOpen, setIsOpen] = useState(false);
    const anchorClass = `s-parameter-filter-anchor-${filter.localIdentifier}`;

    const warningTooltip = isValidParameterValue(filter.definition, filter.value)
        ? undefined
        : intl.formatMessage({ id: "filter_bar_parameter.reset_warning.tooltip" });

    const handleCommit = (value: ParameterValue) => {
        onUpdate({ ...filter, value });
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <FilterItem
            identifier={filter.localIdentifier}
            className={classNames("s-parameter-filter-item", {
                "is-highlighted": isHighlighted,
            })}
        >
            <ParameterControlButton
                name={filter.name}
                definition={filter.definition}
                value={filter.value}
                isActive={isOpen}
                isDraggable
                warningTooltip={warningTooltip}
                onClick={() => setIsOpen((prev) => !prev)}
                className={classNames("s-filter-button", "s-parameter-filter-button", className, anchorClass)}
            />
            {isOpen ? (
                <Overlay
                    alignTo={`.${anchorClass}`}
                    alignPoints={DROPDOWN_ALIGNMENTS}
                    closeOnOutsideClick
                    closeOnParentScroll
                    closeOnMouseDrag
                    onClose={handleClose}
                >
                    <ParameterControl
                        name={filter.name}
                        definition={filter.definition}
                        value={filter.value}
                        resetValue={filter.definition.defaultValue}
                        mode="commit"
                        onCommit={handleCommit}
                        onClose={handleClose}
                    />
                </Overlay>
            ) : null}
        </FilterItem>
    );
}
