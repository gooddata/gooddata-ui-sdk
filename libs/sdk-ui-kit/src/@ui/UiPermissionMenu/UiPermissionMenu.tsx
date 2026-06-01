// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type ReactElement, useRef } from "react";

import { useIntl } from "react-intl";

import { olpPermissionMessages } from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";
import { UiPopover } from "../UiPopover/UiPopover.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

const { b, e } = bem("gd-ui-kit-permission-menu");

/**
 * Permission level offered by the menu.
 *
 * @internal
 */
export type PermissionMenuLevel = "VIEW" | "SHARE";

/**
 * @internal
 */
export interface IUiPermissionMenuProps {
    /** Element that opens the menu on click. */
    anchor: ReactElement<any>;
    /** Currently selected permission level — drives `aria-checked`. */
    selectedLevel?: PermissionMenuLevel;
    /** Fires when the user picks a permission level. */
    onPermissionChange: (level: PermissionMenuLevel) => void;
    /** Fires when the user picks Transfer ownership. */
    onTransferOwnership?: () => void;
    /**
     * Fires when the user picks the Labels entry. Display the count via
     * `labelsCounter`.
     */
    onLabelsClick?: () => void;
    /**
     * Counter shown next to the Labels row (e.g. `"4/4"`). Hidden
     * if omitted.
     */
    labelsCounter?: string;
    /** Fires when the user picks Remove access. */
    onRemoveAccess?: () => void;
    /** Test id forwarded to the menu body. */
    dataTestId?: string;
}

interface IPermissionItem {
    key: string;
    label: string;
    tooltip?: string;
    counter?: string;
    /**
     * When set, the row participates in the radio group as a
     * `menuitemradio` with `aria-checked` driven by
     * matching `selectedLevel`. Action rows omit this and render
     * as a plain `menuitem`.
     */
    radioValue?: PermissionMenuLevel;
    onClick: () => void;
}

/**
 * Per-grantee permission popover. Renders a fixed set of rows — two
 * permission levels (Can view & share / Can view), an optional divider,
 * and optional Transfer ownership / Labels / Remove access action rows.
 * Each level row carries an `infoCircle` tooltip.
 *
 * @internal
 */
export function UiPermissionMenu({
    anchor,
    selectedLevel,
    onPermissionChange,
    onTransferOwnership,
    onLabelsClick,
    labelsCounter,
    onRemoveAccess,
    dataTestId,
}: IUiPermissionMenuProps) {
    return (
        <UiPopover
            anchor={anchor}
            anchorAccessibilityConfig={{ ariaHaspopup: "menu" }}
            width={180}
            content={({ onClose }) => (
                <MenuBody
                    selectedLevel={selectedLevel}
                    onPermissionChange={onPermissionChange}
                    onTransferOwnership={onTransferOwnership}
                    onLabelsClick={onLabelsClick}
                    labelsCounter={labelsCounter}
                    onRemoveAccess={onRemoveAccess}
                    onClose={onClose}
                    dataTestId={dataTestId}
                />
            )}
        />
    );
}

interface IMenuBodyProps {
    selectedLevel?: PermissionMenuLevel;
    onPermissionChange: (level: PermissionMenuLevel) => void;
    onTransferOwnership?: () => void;
    onLabelsClick?: () => void;
    labelsCounter?: string;
    onRemoveAccess?: () => void;
    onClose: () => void;
    dataTestId?: string;
}

function MenuBody({
    selectedLevel,
    onPermissionChange,
    onTransferOwnership,
    onLabelsClick,
    labelsCounter,
    onRemoveAccess,
    onClose,
    dataTestId,
}: IMenuBodyProps) {
    const intl = useIntl();
    const choose = (next: () => void) => () => {
        next();
        onClose();
    };

    const levelItems: IPermissionItem[] = [
        {
            key: "SHARE",
            label: intl.formatMessage(olpPermissionMessages.canViewAndShare),
            tooltip: intl.formatMessage(olpPermissionMessages.canViewAndShareTooltip),
            radioValue: "SHARE",
            onClick: choose(() => onPermissionChange("SHARE")),
        },
        {
            key: "VIEW",
            label: intl.formatMessage(olpPermissionMessages.canView),
            tooltip: intl.formatMessage(olpPermissionMessages.canViewTooltip),
            radioValue: "VIEW",
            onClick: choose(() => onPermissionChange("VIEW")),
        },
    ];

    const actionItems: IPermissionItem[] = [];
    if (onTransferOwnership) {
        actionItems.push({
            key: "transfer",
            label: intl.formatMessage(olpPermissionMessages.transferOwnership),
            onClick: choose(onTransferOwnership),
        });
    }
    if (onLabelsClick) {
        actionItems.push({
            key: "labels",
            label: intl.formatMessage(olpPermissionMessages.labels),
            counter: labelsCounter,
            onClick: choose(onLabelsClick),
        });
    }
    if (onRemoveAccess) {
        actionItems.push({
            key: "remove",
            label: intl.formatMessage(olpPermissionMessages.removeAccess),
            onClick: choose(onRemoveAccess),
        });
    }

    const menuRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const root = menuRef.current;
        if (!root) return;
        const focusable = Array.from(root.querySelectorAll<HTMLButtonElement>('button[role^="menuitem"]'));
        const currentIndex = focusable.indexOf(document.activeElement as HTMLButtonElement);
        if (currentIndex < 0) return;
        let nextIndex: number | null = null;
        switch (event.key) {
            case "ArrowDown":
                nextIndex = (currentIndex + 1) % focusable.length;
                break;
            case "ArrowUp":
                nextIndex = (currentIndex - 1 + focusable.length) % focusable.length;
                break;
            case "Home":
                nextIndex = 0;
                break;
            case "End":
                nextIndex = focusable.length - 1;
                break;
            default:
                return;
        }
        event.preventDefault();
        focusable[nextIndex]?.focus();
    };

    return (
        <div className={b()} data-testid={dataTestId}>
            <div
                ref={menuRef}
                className={e("items")}
                role="menu"
                aria-orientation="vertical"
                aria-label={intl.formatMessage(olpPermissionMessages.menuLabel)}
                onKeyDown={handleKeyDown}
            >
                {levelItems.map((item) => (
                    <PermissionMenuItem key={item.key} item={item} selectedLevel={selectedLevel} />
                ))}
                {actionItems.length > 0 ? <div className={e("divider")} role="separator" /> : null}
                {actionItems.map((item) => (
                    <PermissionMenuItem key={item.key} item={item} selectedLevel={selectedLevel} />
                ))}
            </div>
        </div>
    );
}

interface IPermissionMenuItemProps {
    item: IPermissionItem;
    selectedLevel?: PermissionMenuLevel;
}

function PermissionMenuItem({ item, selectedLevel }: IPermissionMenuItemProps) {
    const intl = useIntl();
    // Tooltip anchor must live OUTSIDE the menu-item button so we don't nest an
    // interactive element inside a button (invalid HTML, breaks focus). The row
    // wrapper provides the flex layout; the button covers label + counter; the
    // tooltip sits next to the button.
    const isRadio = !!item.radioValue;
    const isChecked = isRadio && item.radioValue === selectedLevel;
    return (
        <div className={e("item-row")}>
            <button
                type="button"
                role={isRadio ? "menuitemradio" : "menuitem"}
                aria-checked={isRadio ? isChecked : undefined}
                className={e("item")}
                onClick={item.onClick}
            >
                <span className={e("item-label")}>{item.label}</span>
                {item.counter ? <span className={e("item-counter")}>{item.counter}</span> : null}
            </button>
            {item.tooltip ? (
                <UiTooltip
                    triggerBy={["hover", "focus"]}
                    content={item.tooltip}
                    anchor={
                        <UiIconButton
                            icon="infoCircle"
                            variant="tertiary"
                            size="small"
                            accessibilityConfig={{
                                ariaLabel: intl.formatMessage(olpPermissionMessages.moreInfoAriaLabel, {
                                    label: item.label,
                                }),
                            }}
                        />
                    }
                />
            ) : null}
        </div>
    );
}
