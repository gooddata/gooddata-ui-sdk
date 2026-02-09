// (C) 2025-2026 GoodData Corporation

import { type ReactElement, memo, useCallback } from "react";

import { DefaultUiMenuHeader } from "./DefaultUiMenuHeader.js";
import { typedUiMenuContextStore } from "../../context.js";
import { e } from "../../menuBem.js";
import { type IUiMenuContentItem, type IUiMenuContentProps } from "../../types.js";

/**
 * Container for rendering custom content in menu.
 * @internal
 */
export const DefaultUiMenuContent = memo<IUiMenuContentProps>(function DefaultUiMenuContent({
    item,
}: {
    item: IUiMenuContentItem;
}): ReactElement {
    const { useContextStore, createSelector } = typedUiMenuContextStore();
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
                <ContentComponent onBack={handleBack} onClose={onClose ?? (() => {})} />
            </div>
        </>
    );
});
