// (C) 2026 GoodData Corporation

import { type KeyboardEvent, useId, useState } from "react";

import { useIntl } from "react-intl";

import { commonDialogMessages, olpLabelMessages } from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { UiButton } from "../UiButton/UiButton.js";
import { UiLabelChecklistRow } from "../UiLabelChecklistRow/UiLabelChecklistRow.js";
import { type LabelRowKind } from "../UiLabelRow/UiLabelRow.js";
import { UiSubmenuHeader } from "../UiSubmenuHeader/UiSubmenuHeader.js";

const { b, e } = bem("gd-ui-kit-labels-checklist");

/**
 * One label entry in the checklist.
 *
 * @internal
 */
export interface IUiLabelsChecklistItem {
    id: string;
    label: string;
    kind?: LabelRowKind;
    /** Locked rows render checked + disabled and are always included (the primary key). */
    locked?: boolean;
}

/**
 * Whether an item counts as selected: locked items always do, otherwise
 * membership in `selectedIds`. Exported so callers apply the same rule.
 *
 * @internal
 */
export const isLabelsChecklistItemChecked = (
    item: IUiLabelsChecklistItem,
    selectedIds: ReadonlyArray<string>,
): boolean => item.locked === true || selectedIds.includes(item.id);

/**
 * @internal
 */
export interface IUiLabelsChecklistProps {
    items: ReadonlyArray<IUiLabelsChecklistItem>;
    /** Locked items are always selected regardless of this. */
    defaultSelectedIds: ReadonlyArray<string>;
    /** Fires on Apply with the locked-augmented selection (staged internally until then). */
    onApply: (selectedIds: string[]) => void;
    /** Back arrow — returns to the parent view. */
    onBack: () => void;
    /** Dismisses the menu; Cancel and (post-commit) Apply both call it. */
    onClose: () => void;
    dataTestId?: string;
}

/**
 * Per-label checklist drill-in for the grantee "⋯" menu. Stages selection
 * internally, commits via `onApply`, and renders its own back-only header so it
 * slots into {@link UiMenu} as a `showComponentOnly` content item.
 *
 * @internal
 */
export function UiLabelsChecklist({
    items,
    defaultSelectedIds,
    onApply,
    onBack,
    onClose,
    dataTestId,
}: IUiLabelsChecklistProps) {
    const intl = useIntl();
    const groupId = useId();
    // Staged toggles only; locked ids are folded in by the predicate, not stored here.
    const [selected, setSelected] = useState<ReadonlyArray<string>>(() => [...defaultSelectedIds]);

    const toggle = (id: string, next: boolean) => {
        setSelected((prev) =>
            next ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id),
        );
    };

    const handleApply = () => {
        onApply(items.filter((item) => isLabelsChecklistItemChecked(item, selected)).map((item) => item.id));
        onClose();
    };

    // Dirty when any row's checked-state differs from its initial. Locked rows are
    // checked on both sides, so they never count as a change.
    const isDirty = items.some(
        (item) =>
            isLabelsChecklistItemChecked(item, defaultSelectedIds) !==
            isLabelsChecklistItemChecked(item, selected),
    );

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        // Enter commits — scoped to the rows so the footer buttons keep native Enter.
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
            <UiSubmenuHeader
                title={intl.formatMessage(olpLabelMessages.popoverTitle)}
                backAriaLabel={intl.formatMessage(olpLabelMessages.backAriaLabel)}
                height="medium"
                onBack={onBack}
            />
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
                        checked={isLabelsChecklistItemChecked(item, selected)}
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
