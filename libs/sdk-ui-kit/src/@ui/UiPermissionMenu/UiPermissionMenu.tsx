// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type ReactElement, useRef, useState } from "react";

import { useIntl } from "react-intl";

import { olpPermissionMessages } from "../../locales.js";
import { type IconType } from "../@types/icon.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";
import { type IUiLabelsChecklistItem, UiLabelsChecklist } from "../UiLabelsChecklist/UiLabelsChecklist.js";
import { UiPopover } from "../UiPopover/UiPopover.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

const { b, e } = bem("gd-ui-kit-permission-menu");

/**
 * Selectable permission level. The menu and the add-grantee picker only ever
 * assign VIEW or SHARE — EDIT is shown as a read-only row (via the model's
 * `AccessGranularPermission`) and is never selectable from the UI.
 *
 * @internal
 */
export type PermissionMenuLevel = "VIEW" | "SHARE";

/**
 * @internal
 */
export interface IUiPermissionMenuProps {
    /** Element that opens the menu on click. */
    anchor: ReactElement;
    /** Currently selected permission level — drives `aria-checked`. */
    selectedLevel?: PermissionMenuLevel;
    /** Fires when the user picks a permission level. */
    onPermissionChange: (level: PermissionMenuLevel) => void;
    /**
     * Levels rendered disabled (`aria-disabled`, click blocked) — e.g. levels
     * above the caller's own when they manage their own access.
     */
    disabledLevels?: ReadonlyArray<PermissionMenuLevel>;
    /** Tooltip shown on disabled level rows in place of the level's info text. */
    disabledTooltip?: string;
    /**
     * Non-empty enables a labels row that drills into {@link UiLabelsChecklist}
     * within the menu — for rows whose menu hosts every action (no "⋯" menu).
     */
    labels?: ReadonlyArray<IUiLabelsChecklistItem>;
    /** Locked items are always treated as selected. */
    selectedLabelIds?: ReadonlyArray<string>;
    /** Fires with the applied label selection from the labels drill-in. */
    onLabelsChange?: (selectedIds: string[]) => void;
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
    /** Trailing icon (the labels row's drill-in chevron). */
    iconRight?: IconType;
    /**
     * When set, the row participates in the radio group as a
     * `menuitemradio` with `aria-checked` driven by
     * matching `selectedLevel`. Action rows omit this and render
     * as a plain `menuitem`.
     */
    radioValue?: PermissionMenuLevel;
    /** Renders the row `aria-disabled` and blocks its onClick. */
    disabled?: boolean;
    onClick: () => void;
}

/**
 * Per-grantee permission popover. Renders a fixed set of rows — two
 * permission levels (Can view & share / Can view), an optional divider,
 * an optional labels drill-in and an optional Remove access action row.
 * Each level row carries an `infoCircle` tooltip; disabled level rows
 * (`disabledLevels`) swap it for `disabledTooltip`.
 *
 * @internal
 */
export function UiPermissionMenu({
    anchor,
    selectedLevel,
    onPermissionChange,
    disabledLevels,
    disabledTooltip,
    labels,
    selectedLabelIds,
    onLabelsChange,
    onRemoveAccess,
    dataTestId,
}: IUiPermissionMenuProps) {
    const hasLabels = (labels?.length ?? 0) > 0;
    return (
        <UiPopover
            anchor={anchor}
            anchorAccessibilityConfig={{ ariaHaspopup: "menu" }}
            width={hasLabels ? 200 : 180}
            content={({ onClose }) => (
                <MenuBody
                    selectedLevel={selectedLevel}
                    onPermissionChange={onPermissionChange}
                    disabledLevels={disabledLevels}
                    disabledTooltip={disabledTooltip}
                    labels={labels}
                    selectedLabelIds={selectedLabelIds}
                    onLabelsChange={onLabelsChange}
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
    disabledLevels?: ReadonlyArray<PermissionMenuLevel>;
    disabledTooltip?: string;
    labels?: ReadonlyArray<IUiLabelsChecklistItem>;
    selectedLabelIds?: ReadonlyArray<string>;
    onLabelsChange?: (selectedIds: string[]) => void;
    onRemoveAccess?: () => void;
    onClose: () => void;
    dataTestId?: string;
}

function MenuBody({
    selectedLevel,
    onPermissionChange,
    disabledLevels,
    disabledTooltip,
    labels,
    selectedLabelIds,
    onLabelsChange,
    onRemoveAccess,
    onClose,
    dataTestId,
}: IMenuBodyProps) {
    const intl = useIntl();
    // Drill-in state — swaps the row list for the labels checklist. Local to the
    // popover content, so it resets every time the menu opens.
    const [view, setView] = useState<"menu" | "labels">("menu");
    const choose = (next: () => void) => () => {
        next();
        onClose();
    };

    const hasLabels = (labels?.length ?? 0) > 0;

    const levelItem = (level: PermissionMenuLevel, label: string, tooltip: string): IPermissionItem => {
        const disabled = disabledLevels?.includes(level) ?? false;
        return {
            key: level,
            label,
            // A disabled level explains why it can't be picked instead of what it does.
            tooltip: disabled && disabledTooltip ? disabledTooltip : tooltip,
            radioValue: level,
            disabled,
            onClick: disabled ? () => {} : choose(() => onPermissionChange(level)),
        };
    };

    const levelItems: IPermissionItem[] = [
        levelItem(
            "SHARE",
            intl.formatMessage(olpPermissionMessages.canViewAndShare),
            intl.formatMessage(olpPermissionMessages.canViewAndShareTooltip),
        ),
        levelItem(
            "VIEW",
            intl.formatMessage(olpPermissionMessages.canView),
            intl.formatMessage(olpPermissionMessages.canViewTooltip),
        ),
    ];

    const actionItems: IPermissionItem[] = [];
    if (hasLabels) {
        actionItems.push({
            key: "labels",
            label: intl.formatMessage(olpPermissionMessages.labels),
            icon: "ldmLabel",
            iconRight: "navigateRight",
            // Drill in — the checklist owns Back/Cancel/Apply and closes the menu itself.
            onClick: () => setView("labels"),
        });
    }
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

    if (view === "labels") {
        return (
            <div className={b()} data-testid={dataTestId}>
                <UiLabelsChecklist
                    items={labels ?? []}
                    defaultSelectedIds={selectedLabelIds ?? []}
                    onApply={(ids) => onLabelsChange?.(ids)}
                    onBack={() => setView("menu")}
                    onClose={onClose}
                    dataTestId={dataTestId}
                />
            </div>
        );
    }

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
                // Disabled rows stay focusable so their explanatory tooltip is
                // keyboard-reachable — aria-disabled, not the disabled attribute.
                aria-disabled={item.disabled ? true : undefined}
                className={e("item", { disabled: Boolean(item.disabled) })}
                onClick={item.onClick}
            >
                {item.icon ? <UiIcon type={item.icon} size={16} color="complementary-7" /> : null}
                <span className={e("item-label")}>{item.label}</span>
                {item.iconRight ? <UiIcon type={item.iconRight} size={14} color="complementary-7" /> : null}
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
