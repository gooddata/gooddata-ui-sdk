// (C) 2025 GoodData Corporation

import { memo, ReactNode, useCallback } from "react";
import cx from "classnames";
import { e } from "../../menuBem.js";
import { UiIconButton } from "../../../UiIconButton/UiIconButton.js";
import { useIntl } from "react-intl";
import { ShortenedText } from "../../../../ShortenedText/index.js";
import { Button } from "../../../../Button/index.js";
import { typedUiMenuContextStore } from "../../context.js";
import { getItemInteractiveParent } from "../../itemUtils.js";
import { IUiMenuItemData } from "../../types.js";

/**
 * Renders the submenu header when in a submenu.
 * If not in a submenu, returns null.
 * @internal
 */
export const DefaultUiMenuHeader = memo(function DefaultUiMenuHeader<
    T extends IUiMenuItemData = object,
>(): ReactNode {
    const { formatMessage } = useIntl();

    const { useContextStore, createSelector } = typedUiMenuContextStore<T>();
    const selector = createSelector((ctx) => ({
        setFocusedId: ctx.setFocusedId,
        onClose: ctx.onClose,
        parentItem: ctx.focusedItem ? getItemInteractiveParent(ctx.items, ctx.focusedItem.id) : undefined,
        focusedItem: ctx.focusedItem,
        shownCustomContentItemId: ctx.shownCustomContentItemId,
        setShownCustomContentItemId: ctx.setShownCustomContentItemId,
    }));

    const {
        setFocusedId,
        onClose,
        parentItem,
        focusedItem,
        shownCustomContentItemId,
        setShownCustomContentItemId,
    } = useContextStore(selector);

    const parentItemId = parentItem?.id;

    const handleBack = useCallback(() => {
        if (parentItemId === undefined) {
            return;
        }

        setFocusedId(parentItemId);
        if (shownCustomContentItemId) {
            setShownCustomContentItemId(undefined);
        }
    }, [setFocusedId, parentItemId, shownCustomContentItemId, setShownCustomContentItemId]);

    if (!parentItem && !shownCustomContentItemId) {
        return null;
    }

    const title = parentItem?.stringTitle ?? focusedItem?.stringTitle;

    return (
        <div role={"presentation"} className={e("menu-header")}>
            <Button
                onClick={handleBack}
                className={cx(e("menu-header-title"), "gd-icon-navigateleft")}
                accessibilityConfig={{
                    ariaLabel: formatMessage({ id: "menu.back" }),
                }}
            >
                <ShortenedText
                    tagName={"h3"}
                    ellipsisPosition={"end"}
                    className={e("menu-header-title-text")}
                >
                    {title}
                </ShortenedText>
            </Button>
            <UiIconButton
                size={"xsmall"}
                variant={"tertiary"}
                icon={"close"}
                label={formatMessage({ id: "menu.close" })}
                onClick={onClose}
                dataId={"s-menu-close-button"}
                dataTestId={"s-menu-close-button"}
            />
        </div>
    );
});
