// (C) 2025-2026 GoodData Corporation

import { useId, useMemo } from "react";

import { type IntlShape } from "react-intl";

import { type IUiMenuInteractiveItem, Overlay, UiMenu } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../locales.js";

export interface ITotalActionMenuProps {
    intl: IntlShape;
    anchor: HTMLElement;
    onRenameClick: () => void;
    onResetClick: () => void;
    onClose: () => void;
}

type TotalActionMenuItemId = "rename" | "reset";
type TotalActionMenuItemData = { interactive: TotalActionMenuItemId };

export function TotalActionMenu({
    intl,
    anchor,
    onRenameClick,
    onResetClick,
    onClose,
}: ITotalActionMenuProps) {
    const menuId = useId();

    const items = useMemo<IUiMenuInteractiveItem<TotalActionMenuItemData>[]>(
        () => [
            {
                type: "interactive",
                id: "rename",
                stringTitle: intl.formatMessage(messages["renameTotalLabel"]),
                data: "rename",
            },
            {
                type: "interactive",
                id: "reset",
                stringTitle: intl.formatMessage(messages["resetTotalLabel"]),
                data: "reset",
            },
        ],
        [intl],
    );

    return (
        <Overlay
            alignTo={anchor}
            alignPoints={[{ align: "bl tl" }, { align: "tl bl" }, { align: "br tr" }]}
            closeOnOutsideClick
            closeOnParentScroll
            closeOnEscape
            closeOnMouseDrag
            onClose={onClose}
        >
            <UiMenu<TotalActionMenuItemData>
                items={items}
                onSelect={(item) => {
                    if (item.data === "rename") {
                        onRenameClick();
                    } else {
                        onResetClick();
                    }
                }}
                onClose={onClose}
                shouldCloseOnSelect={false}
                size="small"
                dataTestId="pivot-table-total-action-menu"
                itemDataTestId={(item) =>
                    item.type === "interactive" ? `total-action-${item.data}` : undefined
                }
                ariaAttributes={{
                    id: menuId,
                    "aria-label": intl.formatMessage(messages["totalLabelActions"]),
                }}
            />
        </Overlay>
    );
}
