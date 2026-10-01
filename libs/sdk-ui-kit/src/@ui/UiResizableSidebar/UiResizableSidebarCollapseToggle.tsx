// (C) 2026 GoodData Corporation

import { type ReactElement, useEffect, useRef } from "react";

import { bem } from "../@utils/bem.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";

import { useUiResizableSidebarFocusRegistry } from "./UiResizableSidebarContext.js";

const { e } = bem("gd-ui-kit-resizable-sidebar");

/**
 * @internal
 */
export interface IUiResizableSidebarCollapseToggleProps {
    isCollapsed: boolean;
    onToggle: () => void;
    /**
     * Accessible name while the sidebar is expanded, e.g. "Collapse sidebar".
     */
    collapseLabel: string;
    /**
     * Accessible name while the sidebar is collapsed, e.g. "Expand sidebar".
     */
    expandLabel: string;
    dataTestId?: string;
}

/**
 * Collapses and expands a {@link UiResizableSidebar}. Render it in the sidebar header, in a collapsed
 * rail, or anywhere under the same state, e.g. as the restore control of a fully hidden sidebar.
 *
 * @remarks
 * Under a {@link UiResizableSidebarProvider}, a toggle that becomes unusable by its own activation (it is
 * unmounted, or turns inert with a completely hidden sidebar) hands keyboard focus to another toggle under
 * the same provider, even one that mounts later. A sidebar that hides completely therefore needs a second
 * toggle outside it, e.g. in a page header.
 *
 * @internal
 */
export function UiResizableSidebarCollapseToggle({
    isCollapsed,
    onToggle,
    collapseLabel,
    expandLabel,
    dataTestId,
}: IUiResizableSidebarCollapseToggleProps): ReactElement {
    const label = isCollapsed ? expandLabel : collapseLabel;
    const registry = useUiResizableSidebarFocusRegistry();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const activatedRef = useRef(false);

    useEffect(() => {
        const button = buttonRef.current;

        if (!registry || !button) {
            return undefined;
        }

        const unregister = registry.register(button);

        return () => {
            unregister();

            // An activated toggle that disappears with the change hands focus on its way out.
            if (activatedRef.current) {
                activatedRef.current = false;
                registry.handOff(null);
            }
        };
    }, [registry]);

    useEffect(() => {
        if (!activatedRef.current) {
            return;
        }

        activatedRef.current = false;

        registry?.handOff(buttonRef.current);
    }, [isCollapsed, registry]);

    const handleClick = () => {
        activatedRef.current = !!registry;
        onToggle();
    };

    return (
        <div className={e("collapse-toggle")}>
            <UiIconButton
                ref={buttonRef}
                icon="sidePanel"
                label={label}
                size="medium"
                variant="tertiary"
                dataTestId={dataTestId}
                accessibilityConfig={{ ariaLabel: label, ariaExpanded: !isCollapsed }}
                onClick={handleClick}
            />
        </div>
    );
}
