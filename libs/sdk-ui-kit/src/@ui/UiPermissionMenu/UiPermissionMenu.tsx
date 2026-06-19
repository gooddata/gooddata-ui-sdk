// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type ReactElement, useRef } from "react";

import { useIntl } from "react-intl";

import { olpPermissionMessages } from "../../locales.js";
import { type IconType } from "../@types/icon.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
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
    /** Fires when the user picks Remove access. */
    onRemoveAccess?: () => void;
    /** Test id forwarded to the menu body. */
    dataTestId?: string;
}

interface IPermissionItem {
    key: string;
    label: string;
    tooltip?: string;
    /** Leading icon (action rows only, e.g. the trash icon on Remove access). */
    icon?: IconType;
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
 * and an optional Remove access action row. Each level row carries an
 * `infoCircle` tooltip. Labels and Transfer ownership live in the separate
 * {@link UiMoreOptionsMenu}.
 *
 * @internal
 */
export function UiPermissionMenu({
    anchor,
    selectedLevel,
    onPermissionChange,
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
    onRemoveAccess?: () => void;
    onClose: () => void;
    dataTestId?: string;
}

function MenuBody({
    selectedLevel,
    onPermissionChange,
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
    if (onRemoveAccess) {
        actionItems.push({
            key: "remove",
            label: intl.formatMessage(olpPermissionMessages.removeAccess),
            icon: "trash",
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
    // wrapper provides the flex layout; the button covers the label; the
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
                {item.icon ? <UiIcon type={item.icon} size={16} color="complementary-7" /> : null}
                <span className={e("item-label")}>{item.label}</span>
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
