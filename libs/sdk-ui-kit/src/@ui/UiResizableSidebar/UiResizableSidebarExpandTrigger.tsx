// (C) 2026 GoodData Corporation

import { type ReactElement, useEffect, useRef } from "react";

import { bem } from "../@utils/bem.js";

import { useUiResizableSidebarFocusRegistry } from "./UiResizableSidebarContext.js";

const { e } = bem("gd-ui-kit-resizable-sidebar");

/**
 * @internal
 */
export interface IUiResizableSidebarExpandTriggerProps {
    onExpand: () => void;
    /**
     * Accessible name, e.g. "Expand sidebar".
     */
    label: string;
    dataTestId?: string;
}

/**
 * Expands a fully hidden {@link UiResizableSidebar} from the edge it collapsed to. Render it as the
 * sibling right before the collapsed sidebar: it keeps a 10px hit area over the content edge with no
 * layout footprint, and slides a bar in on hover and keyboard focus. Click, Enter or Space expand.
 *
 * @internal
 */
export function UiResizableSidebarExpandTrigger({
    onExpand,
    label,
    dataTestId,
}: IUiResizableSidebarExpandTriggerProps): ReactElement {
    const registry = useUiResizableSidebarFocusRegistry();
    const activatedRef = useRef(false);

    // The trigger disappears with the expand; a usable collapse toggle takes focus on its way out.
    useEffect(
        () => () => {
            if (activatedRef.current) {
                activatedRef.current = false;
                registry?.handOff(null);
            }
        },
        [registry],
    );

    const handleClick = () => {
        activatedRef.current = !!registry;
        onExpand();
    };

    return (
        <button
            type="button"
            className={e("expand-trigger")}
            aria-label={label}
            data-testid={dataTestId}
            onClick={handleClick}
        />
    );
}
