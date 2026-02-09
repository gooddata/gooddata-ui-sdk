// (C) 2025-2026 GoodData Corporation

import { type FC, type ReactElement, memo, useCallback } from "react";

import { useIntl } from "react-intl";

import { UiSubmenuHeader } from "../../../UiSubmenuHeader/UiSubmenuHeader.js";
import { typedUiMenuContextStore } from "../../context.js";
import { getItemInteractiveParent } from "../../itemUtils.js";
import { e } from "../../menuBem.js";
/**
 * Renders the submenu header when in a submenu.
 * If not in a submenu, returns null.
 * @internal
 */
export const DefaultUiMenuHeader: FC = memo(function DefaultUiMenuHeader(): ReactElement | null {
    const { formatMessage } = useIntl();

    const { useContextStore, createSelector } = typedUiMenuContextStore();
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
            <UiSubmenuHeader
                title={title}
                onBack={handleBack}
                onClose={onClose}
                backAriaLabel={formatMessage({ id: "menu.back" })}
                closeAriaLabel={formatMessage({ id: "menu.close" })}
                useShortenedTitle
                height="large"
            />
        </div>
    );
});
