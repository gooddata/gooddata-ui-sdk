// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type ReactElement, useCallback, useId, useRef, useState } from "react";

import { type MessageDescriptor, useIntl } from "react-intl";

import { olpPermissionMessages } from "../../locales.js";
import { type IconType } from "../@types/icon.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
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
    /** Tooltip shown on disabled level rows, explaining why the level can't be picked. */
    disabledTooltip?: string;
    /**
     * Per-level override of `disabledTooltip`, for menus whose disabled levels have
     * different reasons (capped by the caller's own level vs. already inherited).
     */
    disabledLevelTooltips?: Partial<Record<PermissionMenuLevel, string>>;
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
    /**
     * Renders Remove access disabled (`aria-disabled`, click blocked) instead of
     * hiding it — e.g. for a grantee whose access is inherited, so there is nothing
     * to remove here. Pair with `removeDisabledTooltip` to say why.
     */
    isRemoveDisabled?: boolean;
    /** Tooltip shown on Remove access while it is disabled. */
    removeDisabledTooltip?: string;
    /**
     * Label of the remove row. Defaults to "Remove access"; a picker staging a grantee
     * that holds no access yet passes the shorter "Remove".
     */
    removeAccessLabel?: string;
    /** Test id forwarded to the menu body. */
    dataTestId?: string;
}

interface IPermissionItem {
    key: string;
    label: string;
    /** Explanation of a disabled row, shown as a tooltip over the whole row. */
    tooltip?: string;
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
 * action row. Enabled rows carry no tooltip; a disabled row (`disabledLevels`,
 * `isRemoveDisabled`) shows its explanation as a tooltip over the whole row.
 *
 * @internal
 */
export function UiPermissionMenu({
    anchor,
    selectedLevel,
    onPermissionChange,
    disabledLevels,
    disabledTooltip,
    disabledLevelTooltips,
    labels,
    selectedLabelIds,
    onLabelsChange,
    onRemoveAccess,
    isRemoveDisabled,
    removeDisabledTooltip,
    removeAccessLabel,
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
                    disabledLevelTooltips={disabledLevelTooltips}
                    labels={labels}
                    selectedLabelIds={selectedLabelIds}
                    onLabelsChange={onLabelsChange}
                    onRemoveAccess={onRemoveAccess}
                    isRemoveDisabled={isRemoveDisabled}
                    removeDisabledTooltip={removeDisabledTooltip}
                    removeAccessLabel={removeAccessLabel}
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
    disabledLevelTooltips?: Partial<Record<PermissionMenuLevel, string>>;
    labels?: ReadonlyArray<IUiLabelsChecklistItem>;
    selectedLabelIds?: ReadonlyArray<string>;
    onLabelsChange?: (selectedIds: string[]) => void;
    onRemoveAccess?: () => void;
    isRemoveDisabled?: boolean;
    removeDisabledTooltip?: string;
    removeAccessLabel?: string;
    onClose: () => void;
    dataTestId?: string;
}

function MenuBody({
    selectedLevel,
    onPermissionChange,
    disabledLevels,
    disabledTooltip,
    disabledLevelTooltips,
    labels,
    selectedLabelIds,
    onLabelsChange,
    onRemoveAccess,
    isRemoveDisabled,
    removeDisabledTooltip,
    removeAccessLabel,
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

    const levelItem = (level: PermissionMenuLevel, label: string): IPermissionItem => {
        const disabled = disabledLevels?.includes(level) ?? false;
        return {
            key: level,
            label,
            // Only a disabled level explains itself — why it can't be picked.
            tooltip: disabled ? (disabledLevelTooltips?.[level] ?? disabledTooltip) : undefined,
            radioValue: level,
            disabled,
            onClick: disabled ? () => {} : choose(() => onPermissionChange(level)),
        };
    };

    const levelItems: IPermissionItem[] = [
        levelItem("EDIT", intl.formatMessage(olpPermissionMessages.canEditAndShare)),
        levelItem("SHARE", intl.formatMessage(olpPermissionMessages.canViewAndShare)),
        levelItem("VIEW", intl.formatMessage(olpPermissionMessages.canView)),
    ];

    const actionItems: IPermissionItem[] = [];
    if (hasLabels) {
        actionItems.push({
            key: "labels",
            label: intl.formatMessage(olpPermissionMessages.labels),
            iconRight: "navigateRight",
            // Drill in — the checklist owns Back/Cancel/Apply and closes the menu itself.
            onClick: () => setView({ view: "labels", origin: "nav" }),
        });
    }
    if (onRemoveAccess) {
        // Offered disabled rather than hidden when there is nothing to remove, so the
        // row can explain why instead of the action silently going missing.
        actionItems.push({
            key: "remove",
            label: removeAccessLabel ?? intl.formatMessage(olpPermissionMessages.removeAccess),
            tooltip: isRemoveDisabled ? removeDisabledTooltip : undefined,
            disabled: isRemoveDisabled,
            onClick: isRemoveDisabled ? () => {} : choose(onRemoveAccess),
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
    // The visual tooltip exists only while open, so the explanation is also kept as a
    // persistent hidden description the button points at for assistive tech.
    const descriptionId = useId();
    const button = (
        <button
            type="button"
            ref={focusOnAttach}
            role={isRadio ? "menuitemradio" : "menuitem"}
            aria-checked={isRadio ? isChecked : undefined}
            // Disabled rows stay focusable so their explanatory tooltip is
            // keyboard-reachable — aria-disabled, not the disabled attribute.
            aria-disabled={item.disabled ? true : undefined}
            aria-describedby={item.tooltip ? descriptionId : undefined}
            className={e("item", { disabled: Boolean(item.disabled) })}
            onClick={item.onClick}
        >
            <span className={e("item-label")}>{item.label}</span>
            {item.iconRight ? <UiIcon type={item.iconRight} size={14} color="complementary-7" /> : null}
        </button>
    );
    return (
        <div className={e("item-row")}>
            {item.tooltip ? (
                // The whole row is the tooltip anchor: hovering or focusing a disabled row
                // explains why it can't be picked. The wrapper keeps the row's flex layout.
                <>
                    <UiTooltip
                        triggerBy={["hover", "focus"]}
                        content={<div className={e("item-tooltip")}>{item.tooltip}</div>}
                        anchorWrapperStyles={ROW_ANCHOR_STYLES}
                        anchor={button}
                    />
                    <span className="sr-only" id={descriptionId}>
                        {item.tooltip}
                    </span>
                </>
            ) : (
                button
            )}
        </div>
    );
}

const ROW_ANCHOR_STYLES = { display: "flex", flex: "1 1 auto", minWidth: 0 } as const;
