// (C) 2025 GoodData Corporation

import { memo, ReactNode, useCallback } from "react";
import { e } from "../../menuBem.js";
import { IUiMenuContentItem, IUiMenuItemData } from "../../types.js";
import { typedUiMenuContextStore } from "../../context.js";
import { DefaultUiMenuHeader } from "./DefaultUiMenuHeader.js";

/**
 * Container for rendering custom content in menu.
 * @internal
 */
export const DefaultUiMenuContent = memo(function DefaultUiMenuContent<T extends IUiMenuItemData = object>({
    item,
}: {
    item: IUiMenuContentItem<T>;
}): ReactNode {
    const { useContextStore, createSelector } = typedUiMenuContextStore<T>();
    const selector = createSelector((ctx) => ({
        onClose: ctx.onClose,
        setShownCustomContentItemId: ctx.setShownCustomContentItemId,
        setFocusedId: ctx.setFocusedId,
        shownCustomContentItemId: ctx.shownCustomContentItemId,
    }));

    const { onClose, setShownCustomContentItemId, setFocusedId, shownCustomContentItemId } =
        useContextStore(selector);

    const handleBack = useCallback(() => {
        setFocusedId(shownCustomContentItemId);
        setShownCustomContentItemId(undefined);
    }, [setShownCustomContentItemId, shownCustomContentItemId, setFocusedId]);

    const ContentComponent = item.Component;

    return (
        <>
            {item.showComponentOnly ? null : <DefaultUiMenuHeader />}
            <div className={e("content-container")}>
                <ContentComponent onBack={handleBack} onClose={onClose} />
            </div>
        </>
    );
});
