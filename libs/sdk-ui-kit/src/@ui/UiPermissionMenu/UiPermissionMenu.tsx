// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type ReactElement, useCallback, useRef, useState } from "react";

import { type MessageDescriptor, useIntl } from "react-intl";

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
 * Selectable permission level, mirroring the model's `AccessGranularPermission`:
 * EDIT ("Can edit & share"), SHARE ("Can view & share") and VIEW ("Can view")
 * are all assignable from the menu.
 *
 * @internal
 */
export type PermissionMenuLevel = "VIEW" | "SHARE" | "EDIT";

const PERMISSION_LEVEL_MESSAGE: Record<PermissionMenuLevel, MessageDescriptor> = {
    EDIT: olpPermissionMessages.canEditAndShare,
    SHARE: olpPermissionMessages.canViewAndShare,
    VIEW: olpPermissionMessages.canView,
};

/**
 * Message descriptor of a permission level's display label ("Can edit & share" /
 * "Can view & share" / "Can view") — for triggers anchoring {@link UiPermissionMenu}.
 *
 * @internal
 */
export function permissionLevelMessage(level: PermissionMenuLevel): MessageDescriptor {
    return PERMISSION_LEVEL_MESSAGE[level];
}

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
     * the signed-in user may not pick because they exceed their own.
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
 * Per-grantee permission popover. Renders a fixed set of rows — three
 * permission levels (Can edit & share / Can view & share / Can view), an
 * optional divider, an optional labels drill-in and an optional Remove access
 * action row. Each level row carries an `infoCircle` tooltip; disabled level
 * rows (`disabledLevels`) swap it for `disabledTooltip`.
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
    // popover content, so it resets every time the menu opens. `origin` is what
    // triggered the current view so the newly-mounted view knows whether to grab
    // focus: a drill-in/return swaps the focused element out of the DOM (focus
    // would otherwise fall to <body>), while the initial open leaves focus to the
    // popover. See `focusOnMount`.
    const [{ view, origin }, setView] = useState<{ view: "menu" | "labels"; origin: "open" | "nav" }>({
        view: "menu",
        origin: "open",
    });
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
            "EDIT",
            intl.formatMessage(olpPermissionMessages.canEditAndShare),
            intl.formatMessage(olpPermissionMessages.canEditAndShareTooltip),
        ),
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
            onClick: () => setView({ view: "labels", origin: "nav" }),
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
                {/* autoFocus on a drill-in hands keyboard focus to the checklist's
                    named Back button (the view swap would otherwise drop it to <body>). */}
                <UiLabelsChecklist
                    items={labels ?? []}
                    defaultSelectedIds={selectedLabelIds ?? []}
                    onApply={(ids) => onLabelsChange?.(ids)}
                    onBack={() => setView({ view: "menu", origin: "nav" })}
                    onClose={onClose}
                    autoFocus={origin === "nav"}
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
                    <PermissionMenuItem
                        key={item.key}
                        item={item}
                        selectedLevel={selectedLevel}
                        // Returning from the checklist restores focus to the row that opened it.
                        autoFocus={item.key === "labels" && origin === "nav"}
                    />
                ))}
            </div>
        </div>
    );
}

interface IPermissionMenuItemProps {
    item: IPermissionItem;
    selectedLevel?: PermissionMenuLevel;
    /** Focus this row's button on mount — used to restore focus when returning from a drill-in. */
    autoFocus?: boolean;
}

function PermissionMenuItem({ item, selectedLevel, autoFocus }: IPermissionMenuItemProps) {
    const intl = useIntl();
    // Tooltip anchor must live OUTSIDE the menu-item button so we don't nest an
    // interactive element inside a button (invalid HTML, breaks focus). The row
    // wrapper provides the flex layout; the button covers the label; the
    // tooltip sits next to the button.
    //
    // When this row opens as the drill-in return target, focus it as it mounts via
    // a callback ref — no effect, and it can't race the button's mount.
    const focusOnAttach = useCallback(
        (node: HTMLButtonElement | null) => {
            if (autoFocus) {
                node?.focus();
            }
        },
        [autoFocus],
    );
    const isRadio = !!item.radioValue;
    const isChecked = isRadio && item.radioValue === selectedLevel;
    return (
        <div className={e("item-row")}>
            <button
                type="button"
                ref={focusOnAttach}
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
