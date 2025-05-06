// (C) 2025 GoodData Corporation

import React from "react";
import { e } from "../menuBem.js";
import { UiMenuHeaderProps } from "../types.js";
import { UiIconButton } from "../../UiIconButton/UiIconButton.js";
import { useIntl } from "react-intl";
import { ShortenedText } from "../../../ShortenedText/index.js";

/**
 * Renders the submenu header when in a submenu.
 * If not in a submenu, returns null.
 * @internal
 */
export function DefaultUiMenuHeaderComponent<InteractiveItemData, StaticItemData>({
    onBack,
    onClose,
    parentItem,
}: UiMenuHeaderProps<InteractiveItemData, StaticItemData>): React.ReactNode {
    const { formatMessage } = useIntl();

    if (!parentItem) {
        return null;
    }

    return (
        <div role={"presentation"} className={e("menu-header")}>
            <button
                onClick={onBack}
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
}
