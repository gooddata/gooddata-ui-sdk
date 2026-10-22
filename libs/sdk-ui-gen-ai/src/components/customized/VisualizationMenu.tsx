// (C) 2026 GoodData Corporation

import { useCallback, useId, useRef, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    type IAlignPoint,
    type IUiMenuItem,
    Overlay,
    UiFocusManager,
    UiIconButton,
    UiMenu,
    UiTooltip,
} from "@gooddata/sdk-ui-kit";

import {
    type IGenAIAssistantVisualizationMenuItem,
    type IGenAIAssistantVisualizationMenuProps,
} from "./types.js";

const MORE_MENU_BUTTON_ID = "gd-gen-ai-chat__conversation__visualization__save__more-menu-button";
const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

type VisualizationMenuItemData = { interactive: IGenAIAssistantVisualizationMenuItem };

/**
 * Default implementation of the VisualizationMenu slot.
 *
 * @alpha
 */
export function DefaultVisualizationMenu({
    items,
    isDisabled,
    ariaDescribedBy,
}: IGenAIAssistantVisualizationMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const intl = useIntl();

    const id = useId();
    const menuId = `menu-${id}`;
    const anchorRef = useRef<HTMLDivElement>(null);
    const moreLabel = intl.formatMessage({ id: "gd.gen-ai.visualisation.menu" });

    const close = useCallback(() => setIsOpen(false), []);

    if (items.length === 0) {
        return null;
    }

    const menuItems: IUiMenuItem<VisualizationMenuItemData>[] = items.map((item) => ({
        type: "interactive",
        id: item.id,
        stringTitle: item.title,
        data: item,
        iconLeft: item.icon,
        isDisabled: item.isDisabled ?? false,
        ariaAttributes: item.ariaAttributes,
    }));

    return (
        <div
            ref={anchorRef}
            id={MORE_MENU_BUTTON_ID}
            className={cx("gd-gen-ai-chat__conversation__visualization__save", {
                active: isOpen,
            })}
        >
            <UiTooltip
                disabled={!moreLabel}
                triggerBy={["focus", "hover"]}
                arrowPlacement="bottom"
                anchor={
                    <UiIconButton
                        dataTestId="gen-ai-visualization-menu-button"
                        onClick={() => setIsOpen(!isOpen)}
                        icon="ellipsis"
                        isDisabled={isDisabled}
                        accessibilityConfig={{
                            role: "button",
                            ariaLabel: moreLabel,
                            ariaDescribedBy,
                            isExpanded: isOpen,
                            popupId: menuId,
                            ariaHaspopup: "menu",
                        }}
                        isActive={isOpen}
                    />
                }
                content={moreLabel}
            />
            {isOpen ? (
                <Overlay
                    closeOnMouseDrag
                    closeOnOutsideClick
                    alignTo={anchorRef.current}
                    alignPoints={overlayAlignPoints}
                    onClose={close}
                    className="gd-gen-ai-chat__conversation__visualization__menu_overlay"
                >
                    <UiFocusManager enableAutofocus enableReturnFocusOnUnmount enableFocusTrap>
                        <UiMenu<VisualizationMenuItemData>
                            dataTestId="gen-ai-visualization-menu-list"
                            items={menuItems}
                            ariaAttributes={{ id: menuId }}
                            onSelect={(item, e) => {
                                item.data.onSelect(e);
                                close();
                            }}
                            onClose={close}
                        />
                    </UiFocusManager>
                </Overlay>
            ) : null}
        </div>
    );
}
