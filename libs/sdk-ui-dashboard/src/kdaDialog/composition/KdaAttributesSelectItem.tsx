// (C) 2025-2026 GoodData Corporation

import { type MouseEvent, type ReactNode, useCallback } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import {
    SELECT_ITEM_ACTION,
    ScopedIdStore,
    UiLink,
    UiTooltip,
    useIsTextTruncated,
} from "@gooddata/sdk-ui-kit";

const ONLY_ACTION = "only";
const LABEL_ANCHOR_STYLE = { display: "block", width: "auto" } as const;

export interface IKdaAttributesSelectItemProps<T> {
    item: T;
    title: string;
    isSelected: boolean;
    focusedAction?: string;
    index?: number;
    onSelect: () => void;
    onDeselect: () => void;
    onSelectOnly: () => void;
    right?: ReactNode;
}

export function KdaAttributesSelectItem<T>({
    item,
    title,
    isSelected,
    focusedAction,
    index,
    onSelect,
    onDeselect,
    onSelectOnly,
    right,
}: IKdaAttributesSelectItemProps<T>) {
    const intl = useIntl();
    const makeId = ScopedIdStore.useContextStoreOptional((ctx) => ctx.makeId);
    const label = useIsTextTruncated(title);

    const onItemClick = useCallback(() => {
        if (isSelected) {
            onDeselect();
        } else {
            onSelect();
        }
    }, [isSelected, onSelect, onDeselect]);

    const onOnlyClick = useCallback(
        (event: MouseEvent) => {
            event.stopPropagation();
            onSelectOnly();
        },
        [onSelectOnly],
    );

    const classes = cx(
        "gd-kda-attributes-select-item",
        "gd-attribute-filter-elements-select-item__next",
        "gd-list-item",
        "has-only-visible",
        { "is-selected": isSelected },
        {
            "gd-attribute-filter-list-item--isFocused": !!focusedAction,
            "gd-attribute-filter-list-item--isFocusedSelectItem": focusedAction === SELECT_ITEM_ACTION,
        },
    );

    return (
        <div
            className={classes}
            onClick={onItemClick}
            role="row"
            tabIndex={-1}
            aria-rowindex={index}
            aria-label={title}
        >
            <div role="gridcell" className="gd-attribute-filter-list-item-label">
                <UiTooltip
                    anchor={
                        <label className="input-checkbox-label">
                            <input
                                tabIndex={focusedAction === SELECT_ITEM_ACTION ? 0 : -1}
                                id={makeId?.({ item, specifier: SELECT_ITEM_ACTION })}
                                type="checkbox"
                                className="input-checkbox"
                                readOnly
                                checked={isSelected}
                            />
                            <span ref={label.ref} className="input-label-text">
                                {title}
                            </span>
                        </label>
                    }
                    content={title}
                    disabled={!label.isTruncated}
                    triggerBy={["hover", "focus"]}
                    accessibilityHidden
                    arrowPlacement="left"
                    optimalPlacement
                    offset={10}
                    anchorWrapperStyles={LABEL_ANCHOR_STYLE}
                />
            </div>
            <div
                className={cx("gd-list-item-only", {
                    "gd-list-item-only--isFocusedSelectItem": focusedAction === ONLY_ACTION,
                })}
                role="gridcell"
            >
                <UiLink
                    onClick={onOnlyClick}
                    id={makeId?.({ item, specifier: ONLY_ACTION })}
                    variant="primary"
                    flipUnderline
                    role="button"
                    aria-label={intl.formatMessage(
                        { id: "attributesDropdown.onlyLabel" },
                        { itemTitle: title },
                    )}
                    tabIndex={focusedAction === ONLY_ACTION ? 0 : -1}
                >
                    <FormattedMessage id="gs.list.only" />
                </UiLink>
            </div>
            {right ? (
                <div role="gridcell" className="gd-kda-attributes-select-item__right">
                    {right}
                </div>
            ) : null}
        </div>
    );
}
