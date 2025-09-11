// (C) 2007-2025 GoodData Corporation

import React, { useMemo } from "react";

import { useIntl } from "react-intl";

import { UiTooltip } from "../../@ui/UiTooltip/UiTooltip.js";

/**
 * @internal
 */
export interface IInvertableSelectStatusProps<T> {
    isInverted: boolean;
    selectedItems: T[];
    getItemTitle: (item: T) => string;
}

/**
 * @internal
 */
export function useInvertableSelectionStatusText<T>(
    selectedItems: T[],
    isInverted: boolean,
    getItemTitle: (item: T) => string,
) {
    const intl = useIntl();

    const isSelectionEmpty = selectedItems.length === 0;
    const isAll = isSelectionEmpty && isInverted;
    const isNone = isSelectionEmpty && !isInverted;
    const isAllExcept = !isSelectionEmpty && isInverted;

    const selectionString = useMemo(() => {
        return selectedItems.map((selectedItem) => getItemTitle(selectedItem)).join(", ");
    }, [selectedItems, getItemTitle]);

    const stringChunks = [];
    if (isAll) {
        stringChunks.push(intl.formatMessage({ id: "gs.list.all" }));
    }
    if (isNone) {
        stringChunks.push(intl.formatMessage({ id: "gs.filterLabel.none" }));
    }
    if (isAllExcept) {
        stringChunks.push(
            intl.formatMessage({ id: "gs.list.all" }),
            intl.formatMessage({ id: "gs.list.except" }),
        );
    }
    if (!isAll && !isSelectionEmpty) {
        stringChunks.push(selectionString, `(${selectedItems.length})`);
    }

    return stringChunks.join(" ");
}

/**
 * @internal
 */
export function InvertableSelectStatus<T>(props: IInvertableSelectStatusProps<T>) {
    const { selectedItems, getItemTitle, isInverted } = props;

    const intl = useIntl();

    const isSelectionEmpty = selectedItems.length === 0;
    const isAll = isSelectionEmpty && isInverted;
    const isNone = isSelectionEmpty && !isInverted;
    const isAllExcept = !isSelectionEmpty && isInverted;

    const selectionString = useMemo(() => {
        return selectedItems.map((selectedItem) => getItemTitle(selectedItem)).join(", ");
    }, [selectedItems, getItemTitle]);

    return (
        <>
            <span>&nbsp;{intl.formatMessage({ id: "gs.list.is" })}&nbsp;</span>
            {isAll ? <b>{intl.formatMessage({ id: "gs.list.all" })}</b> : null}
            {isNone ? <b>{intl.formatMessage({ id: "gs.filterLabel.none" })}</b> : null}
            {isAllExcept ? (
                <span>
                    <b>{intl.formatMessage({ id: "gs.list.all" })}</b>&nbsp;
                    {intl.formatMessage({ id: "gs.list.except" })}&nbsp;
                </span>
            ) : null}
            {!isAll && !isSelectionEmpty ? (
                <UiTooltip
                    arrowPlacement="top-start"
                    triggerBy={["hover"]}
                    content={selectionString}
                    anchor={
                        <>
                            <span className="gd-shortened-text gd-selection-list s-dropdown-attribute-selection-list">
                                {selectionString}
                            </span>
                            {`\xa0(${selectedItems.length})`}
                        </>
                    }
                />
            ) : null}
        </>
    );
}
