// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type ReactElement, useCallback, useId, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { commonDialogMessages, olpLabelMessages } from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { UiButton } from "../UiButton/UiButton.js";
import { UiLabelChecklistRow } from "../UiLabelChecklistRow/UiLabelChecklistRow.js";
import { type LabelRowKind } from "../UiLabelRow/UiLabelRow.js";
import { UiPopover } from "../UiPopover/UiPopover.js";

const { b, e } = bem("gd-ui-kit-labels-picker");

/**
 * One label entry in the picker.
 *
 * @internal
 */
export interface IUiLabelsPickerItem {
    /** Stable identifier — used as the React key and in selection state. */
    id: string;
    /** Label text. */
    label: string;
    /** Drives the icon + suffix. Omit for a regular label. */
    kind?: LabelRowKind;
    /**
     * When true the item is rendered locked (checked + disabled). Used for
     * the primary-key row, which is always included.
     */
    locked?: boolean;
}

/**
 * Predicate the picker uses to decide whether an item is effectively selected:
 * locked items always count as selected, otherwise membership in the staged
 * `selected` set. Exported so consumers (e.g. the grantee row counter) can
 * apply the same rule without re-encoding it.
 *
 * @internal
 */
export const isLabelsPickerItemChecked = (
    item: IUiLabelsPickerItem,
    selectedIds: ReadonlyArray<string>,
): boolean => item.locked === true || selectedIds.includes(item.id);

/**
 * @internal
 */
export interface IUiLabelsPickerProps {
    /** Element that opens the picker on click. */
    anchor: ReactElement<any>;
    /** All available label items, in source order. */
    items: ReadonlyArray<IUiLabelsPickerItem>;
    /**
     * Initial set of selected item ids. Locked items are always treated as
     * selected regardless of what's passed here. Consumers that need to
     * reset the staged state when switching contexts (e.g. picking labels
     * for a different grantee) should pass `key={contextId}` so React
     * remounts the picker body.
     */
    defaultSelectedIds: ReadonlyArray<string>;
    /**
     * Fires when the user clicks Apply with the (locked-augmented) set of
     * selected ids. The picker keeps its own staged state — the caller is
     * notified only on commit.
     */
    onApply: (selectedIds: string[]) => void;
    /** Test id forwarded to the picker body. */
    dataTestId?: string;
}

/**
 * Per-label picker popover. Anchored on a click target; stages selection
 * internally and commits via `onApply`. Locked items are always included
 * — at render time via {@link isLabelsPickerItemChecked} and again at
 * commit via the locked-aware filter.
 *
 * @internal
 */
export function UiLabelsPicker({
    anchor,
    items,
    defaultSelectedIds,
    onApply,
    dataTestId,
}: IUiLabelsPickerProps) {
    const intl = useIntl();
    const groupId = useId();
    return (
        <UiPopover
            anchor={anchor}
            anchorAccessibilityConfig={{ ariaHaspopup: "dialog", ariaControls: groupId }}
            title={intl.formatMessage(olpLabelMessages.popoverTitle)}
            width={245}
            content={({ onClose }) => (
                <PickerBody
                    items={items}
                    defaultSelectedIds={defaultSelectedIds}
                    onApply={onApply}
                    onClose={onClose}
                    dataTestId={dataTestId}
                    groupId={groupId}
                />
            )}
        />
    );
}

interface IPickerBodyProps {
    items: ReadonlyArray<IUiLabelsPickerItem>;
    defaultSelectedIds: ReadonlyArray<string>;
    onApply: (selectedIds: string[]) => void;
    onClose: () => void;
    dataTestId?: string;
    groupId: string;
}

function PickerBody({ items, defaultSelectedIds, onApply, onClose, dataTestId, groupId }: IPickerBodyProps) {
    const intl = useIntl();
    // The user's staged toggles. We never merge locked ids into here — the
    // locked-aware predicate handles that at render and at commit. The body
    // only mounts when the popover opens, so this captures the initial
    // selection once; parent rerenders don't disturb staged edits.
    const [selected, setSelected] = useState<ReadonlyArray<string>>(() => [...defaultSelectedIds]);

    const toggle = useCallback((id: string, next: boolean) => {
        setSelected((prev) =>
            next ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id),
        );
    }, []);

    const handleApply = useCallback(() => {
        onApply(items.filter((item) => isLabelsPickerItemChecked(item, selected)).map((item) => item.id));
        onClose();
    }, [items, selected, onApply, onClose]);

    const isDirty = useMemo(() => {
        // Compare against the locked-aware initial set so re-Apply on an
        // unchanged selection stays disabled even when defaultSelectedIds
        // omits a locked id (the picker silently includes it).
        const initial = new Set<string>();
        for (const id of defaultSelectedIds) initial.add(id);
        for (const item of items) if (item.locked) initial.add(item.id);
        const current = new Set<string>();
        for (const item of items) {
            if (isLabelsPickerItemChecked(item, selected)) current.add(item.id);
        }
        if (initial.size !== current.size) return true;
        for (const id of initial) {
            if (!current.has(id)) return true;
        }
        return false;
    }, [items, defaultSelectedIds, selected]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        // Enter commits when something has changed — scoped to the items
        // group only so Enter on the footer Cancel/Apply buttons keeps its
        // native semantics.
        if (event.key === "Enter" && isDirty) {
            event.preventDefault();
            handleApply();
        }
    };

    const suffixFor = (kind: LabelRowKind | undefined) => {
        if (!kind) return undefined;
        return intl.formatMessage(
            kind === "primary" ? olpLabelMessages.suffixPrimary : olpLabelMessages.suffixDefault,
        );
    };

    return (
        <div className={b()} data-testid={dataTestId}>
            <div
                id={groupId}
                className={e("items")}
                role="group"
                aria-label={intl.formatMessage(olpLabelMessages.popoverTitle)}
                onKeyDown={handleKeyDown}
            >
                {items.map((item) => (
                    <UiLabelChecklistRow
                        key={item.id}
                        label={item.label}
                        kind={item.kind}
                        suffix={suffixFor(item.kind)}
                        checked={isLabelsPickerItemChecked(item, selected)}
                        disabled={item.locked}
                        onChange={(next) => toggle(item.id, next)}
                    />
                ))}
            </div>
            <div className={e("actions")}>
                <UiButton
                    variant="secondary"
                    size="small"
                    label={intl.formatMessage(commonDialogMessages.cancel)}
                    onClick={onClose}
                />
                <UiButton
                    variant="primary"
                    size="small"
                    label={intl.formatMessage(commonDialogMessages.apply)}
                    onClick={handleApply}
                    isDisabled={!isDirty}
                />
            </div>
        </div>
    );
}
