// (C) 2025 GoodData Corporation

import React from "react";
import { e } from "../menuBem.js";
import { UiIconButton } from "../../UiIconButton/UiIconButton.js";
import { useIntl } from "react-intl";
import { ShortenedText } from "../../../ShortenedText/index.js";
import { typedUiMenuContextStore } from "../context.js";
import { getItemInteractiveParent } from "../itemUtils.js";

/**
 * Renders the submenu header when in a submenu.
 * If not in a submenu, returns null.
 * @internal
 */
export const DefaultUiMenuHeaderComponent = React.memo(function DefaultUiMenuHeaderComponent<
    InteractiveItemData,
    StaticItemData,
>(): React.ReactNode {
    const { formatMessage } = useIntl();

    const { setFocusedId, onClose, parentItem } = typedUiMenuContextStore<
        InteractiveItemData,
        StaticItemData
    >().useContextStore((ctx) => ({
        setFocusedId: ctx.setFocusedId,
        onClose: ctx.onClose,
        parentItem: ctx.focusedItem ? getItemInteractiveParent(ctx.items, ctx.focusedItem.id) : undefined,
    }));

    const parentItemId = parentItem?.id;

    const handleBack = React.useCallback(() => {
        if (parentItemId === undefined) {
            return;
        }

        setFocusedId(parentItemId);
    }, [setFocusedId, parentItemId]);

    if (!parentItem) {
        return null;
    }

    return (
        <div role={"presentation"} className={e("menu-header")}>
            <button
                onClick={handleBack}
                className={e("menu-header-title")}
                aria-label={formatMessage({ id: "menu.back" })}
            >
                <i className="gd-icon-navigateleft" />
                <ShortenedText
                    tagName={"h3"}
                    ellipsisPosition={"end"}
                    className={e("menu-header-title-text")}
                >
                    {parentItem.stringTitle}
                </ShortenedText>
            </button>
            <UiIconButton
                size={"small"}
                variant={"tertiary"}
                icon={"close"}
                label={formatMessage({ id: "menu.close" })}
                onClick={onClose}
            />
        </div>
    );
});
