// (C) 2026 GoodData Corporation

import { useState } from "react";

import cx from "classnames";
import { isEqual } from "lodash-es";
import { useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { type ISemanticConditionalFormatting, type ISeparators } from "@gooddata/sdk-model";
import { type IDateFilterOptionsByType } from "@gooddata/sdk-ui-filters";
import { Button, type IAlignPoint, Overlay, UiCheckbox, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";
import {
    type ConditionalFormattingTarget,
    type IConditionalFormattingCondition,
    type IConditionalFormattingRule,
} from "@gooddata/sdk-ui-pivot/next";

import { conditionalFormattingMessages } from "../../../../locales.js";
import { DisabledBubbleMessage } from "../../DisabledBubbleMessage.js";

import { CfSelect } from "./CfSelect.js";
import {
    type ICfDateSettings,
    type ITargetOption,
    findTargetOption,
    isDateTarget,
    isRuleComplete,
    newCondition,
    ruleWithTarget,
    sanitizeRuleForEditing,
    targetIcon,
    targetLocalId,
} from "./conditionalFormattingModel.js";
import { ConditionEditor } from "./ConditionEditor.js";
import { ReorderList } from "./ReorderList.js";

// The config panel sits on the right edge of the screen, so open the popover to the LEFT of the
// anchor (self's right edge to the anchor's left edge); fall back to the right when there's no room.
const POPOVER_ALIGN_POINTS: IAlignPoint[] = [
    { align: "cl cr", offset: { x: -5, y: 0 } },
    { align: "cr cl", offset: { x: 5, y: 0 } },
];

// Small "?" info affordance next to the "Use default rule" checkbox. A real `<button>` anchor (not
// the older BubbleHoverTrigger/Bubble pair, which only wires mouse enter/leave and never forwards
// focus-related props to its span) so keyboard/screen-reader users can reach it via Tab too; the
// full text lives in the button's own aria-label, so the floating tooltip is purely visual.
function InfoTooltip({ text }: { text: string }) {
    return (
        <UiTooltip
            anchor={
                <button
                    type="button"
                    className="gd-cf-dialog__use-default-info gd-icon-circle-question"
                    aria-label={text}
                />
            }
            content={text}
            accessibilityHidden
            triggerBy={["hover", "focus"]}
            arrowPlacement="right"
        />
    );
}

/**
 * @internal
 */
export interface IConditionalFormattingDialogProps {
    rule: IConditionalFormattingRule;
    isNew: boolean;
    targetOptions: ITargetOption[];
    /** Workspace number separators; measure value inputs validate and format with them. */
    separators?: ISeparators;
    /** Workspace date-filter preset catalog; date value pickers offer it (undefined = static only). */
    dateFilterOptions?: IDateFilterOptionsByType;
    /** Workspace date-display settings (format, week start) for the date value pickers. */
    dateSettings?: ICfDateSettings;
    /** CSS selector of a small, stable element the popover anchors to. */
    alignTo: string;
    /** Renders a static "icon + title" header for the rule's target instead of the picker dropdown. */
    fixedTarget?: boolean;
    /**
     * Semantic-layer rules by target localId. When the current target has an entry, the dialog
     * offers the "Use default rule" checkbox switching between the inherited rule (locked) and an
     * authored override (editable) — the whole map (not one resolved value) so an untargeted "Add
     * rule" flow re-derives the right fallback if the user changes target mid-dialog.
     */
    semanticByTarget?: Record<string, ISemanticConditionalFormatting>;
    /** Deletes THIS specific authored rule (wired only when one exists) — the trash button. */
    onDelete?: () => void;
    /**
     * Reverts to Inherited: clears every authored rule for `target` (a target can have several
     * stacked custom rules, not just this one) AND this rule's own original id — needed together
     * because a non-fixedTarget dialog lets the user retarget before saving, so the rule being
     * edited may not (yet) be one of the rules actually stored against `target`. Distinct from
     * `onDelete`: triggered only by Save while "Use default rule" is checked.
     */
    onRevertToDefault?: (target: ConditionalFormattingTarget, ruleId: string) => void;
    onSave: (rule: IConditionalFormattingRule) => void;
    onClose: () => void;
}

/**
 * @internal
 */
export function ConditionalFormattingDialog({
    rule: initialRule,
    isNew,
    targetOptions,
    separators,
    dateFilterOptions,
    dateSettings,
    alignTo,
    fixedTarget = false,
    semanticByTarget,
    onDelete,
    onRevertToDefault,
    onSave,
    onClose,
}: IConditionalFormattingDialogProps) {
    const intl = useIntl();
    const initial = sanitizeRuleForEditing(
        initialRule,
        isDateTarget(findTargetOption(targetOptions, initialRule.target)),
    );
    const [rule, setRule] = useState(initial);
    // The blank multi-target Add-Rule flow (isNew, no fixedTarget) must keep its target picker fully
    // usable — starting "Use default rule" checked there just because targetOptions[0] happens to
    // have a semantic entry would lock the very picker the user needs to choose a different target.
    // Editing an EXISTING rule (isNew false) never starts locked regardless of fixedTarget, so this
    // only needs to suppress the brand-new-blank-rule case specifically.
    const activeSemantic = isNew && !fixedTarget ? undefined : semanticByTarget?.[targetLocalId(rule.target)];
    // Only meaningful the first time the dialog opens: a target with no authored rule yet (isNew)
    // and a semantic default to fall back to starts "on" (Inherited); retargeting mid-authoring
    // never revisits this, matching `ruleWithTarget`'s existing "values reset, mode doesn't" behavior.
    const [wantsDefault, setWantsDefault] = useState(() => isNew && activeSemantic !== undefined);
    // A target's semantic default can disappear while this stays open and checked (the catalog
    // object's rule was deleted elsewhere, or a data-view blip dropped the field) — the checkbox
    // itself vanishes with it (rendered only when `activeSemantic` exists), which would otherwise
    // leave fields silently locked with no visible way to unlock them, and Save would revert/delete
    // against a default that no longer exists. Adjusting `wantsDefault` itself here (during render,
    // not in an effect, so there's never a paint where the checkbox is still stale) rather than only
    // deriving `usingDefault` as false makes the unlock permanent: if the default later reappears
    // while the user has since edited the now-unlocked fields, it must not silently re-lock and
    // discard that edit via Save's revert branch.
    if (activeSemantic === undefined && wantsDefault) {
        setWantsDefault(false);
    }
    const usingDefault = wantsDefault && activeSemantic !== undefined;
    const locked = usingDefault;
    // While using the default, always render the LIVE semantic conditions (never a stale draft);
    // the user's own in-progress edits stay in `rule` untouched so unchecking restores them exactly.
    const displayRule =
        usingDefault && activeSemantic ? { ...rule, conditions: activeSemantic.conditions } : rule;

    // Tracks whether `rule.conditions` is still just a mirror of the semantic default (safe to
    // silently resync/discard) versus genuinely the user's own content (an existing authored rule,
    // or anything they've edited since) — which must never be clobbered by a later resync. NOT
    // derivable from `isDirty` two lines below: `isDirty` is unconditionally true whenever `isNew`
    // (nothing to compare against yet), but a fresh isNew dialog that opens already checked can be
    // unchecked before any edit — `draftIsDefault` must still read true there (to reseed from the
    // live default) while `isDirty` already reads true for an unrelated reason. `setConditions`
    // below sets both together, so a future condition-mutator can't add itself while forgetting
    // to flip this — the only way to touch `rule.conditions` here goes through it.
    const [draftIsDefault, setDraftIsDefault] = useState(() => isNew);

    const setConditions = (updater: (current: IConditionalFormattingRule) => IConditionalFormattingRule) => {
        setDraftIsDefault(false);
        setRule(updater);
    };

    const updateCondition = (id: string, next: IConditionalFormattingCondition) => {
        setConditions((current) => ({
            ...current,
            conditions: current.conditions.map((condition) => (condition.id === id ? next : condition)),
        }));
    };

    const removeCondition = (id: string) => {
        setConditions((current) => ({
            ...current,
            conditions: current.conditions.filter((condition) => condition.id !== id),
        }));
    };

    const addCondition = () => {
        setConditions((current) => ({
            ...current,
            conditions: [
                ...current.conditions,
                newCondition(isDateTarget(findTargetOption(targetOptions, current.target))),
            ],
        }));
    };

    const reorderConditions = (conditions: IConditionalFormattingCondition[]) => {
        setConditions((current) => ({ ...current, conditions }));
    };

    const changeTarget = (value: string) => {
        const option = targetOptions.find((candidate) => candidate.value === value);
        if (!option) {
            return;
        }
        setRule((current) =>
            ruleWithTarget(current, option, findTargetOption(targetOptions, current.target)),
        );
    };

    const selectedTarget = findTargetOption(targetOptions, rule.target);
    const singleTarget = fixedTarget ? selectedTarget : undefined;
    const isPercent = selectedTarget?.isPercent ?? false;
    const suggestions = selectedTarget?.elements ?? [];
    const complete = isRuleComplete(rule, selectedTarget?.date);
    const isDirty = isNew || !isEqual(rule, initial);
    // A target with a semantic default reads as a plain "Rule" regardless of which side of the
    // checkbox it's on — the Add/Edit split only applies to targets with no default to switch to.
    const title = intl.formatMessage(
        activeSemantic === undefined
            ? isNew
                ? conditionalFormattingMessages.dialogAddTitle
                : conditionalFormattingMessages.dialogEditTitle
            : conditionalFormattingMessages.dialogRuleTitle,
    );
    // Nothing authored yet to delete while still on the default — the disabled state points the
    // user at the (separate) rule-list toggle instead, per the mock's tooltip. Also disabled whenever
    // the caller hasn't actually given us a way to delete anything: `onDelete` is only real when the
    // caller (Section today) found an authored rule for this dialog's synthetic-or-real id, so its
    // absence must disable the button too, not just leave it clickable-but-inert.
    const deleteDisabled = isNew || !onDelete;
    // The blank multi-target Add-Rule flow (isNew, no fixedTarget) has nothing to show a delete
    // affordance for at all — everywhere else (a semantic-fallback view, or an existing authored
    // rule) shows one, disabled per `deleteDisabled` above when there's genuinely nothing to delete.
    const showDelete = fixedTarget || !isNew;

    return (
        <Overlay
            alignTo={alignTo}
            alignPoints={POPOVER_ALIGN_POINTS}
            closeOnParentScroll
            closeOnMouseDrag
            onClose={onClose}
        >
            <div className="gd-cf-dialog" aria-label={title}>
                <div className="gd-cf-dialog__header">
                    <h3 className="gd-cf-dialog__title">{title}</h3>
                    <Button
                        className="gd-button-link gd-button-icon-only gd-icon-cross"
                        accessibilityConfig={{
                            ariaLabel: intl.formatMessage(conditionalFormattingMessages.dialogCancel),
                        }}
                        onClick={onClose}
                    />
                </div>
                <div className="gd-cf-dialog__body">
                    <span className="gd-cf-dialog__label">
                        {intl.formatMessage(conditionalFormattingMessages.dialogTarget)}
                    </span>
                    {singleTarget ? (
                        <div className="gd-cf-dialog__static-target">
                            <span
                                className={cx(
                                    "gd-cf-type-icon",
                                    targetIcon(singleTarget.target.kind, isDateTarget(singleTarget)),
                                )}
                                aria-hidden="true"
                            />
                            <span className="gd-cf-dialog__static-target-title">{singleTarget.title}</span>
                        </div>
                    ) : (
                        <fieldset className="gd-cf-dialog__target-picker" disabled={locked}>
                            <CfSelect
                                value={selectedTarget?.value}
                                items={targetOptions.map((option) => ({
                                    value: option.value,
                                    title: option.title,
                                    icon: targetIcon(option.target.kind, isDateTarget(option)),
                                }))}
                                onSelect={changeTarget}
                                placeholder={intl.formatMessage(
                                    conditionalFormattingMessages.dialogSelectTarget,
                                )}
                            />
                        </fieldset>
                    )}
                    {activeSemantic ? (
                        <div className="gd-cf-dialog__use-default">
                            <UiCheckbox
                                checked={usingDefault}
                                onChange={(e) => {
                                    const nextUseDefault = e.target.checked;
                                    // Reseed from the live semantic value exactly at the moment of
                                    // unchecking — but only while the draft is still just a mirror of
                                    // the default (draftIsDefault): an existing authored rule, or
                                    // anything the user has actually edited, must never be clobbered.
                                    // This still fixes the "fresher payload arrived while this stayed
                                    // checked" case, since fields are locked (nothing to edit) for as
                                    // long as it's checked, so draftIsDefault can't have gone false then.
                                    if (!nextUseDefault && activeSemantic && draftIsDefault) {
                                        // Sanitize like any other externally-authored rule: a
                                        // semantic condition can carry an operator/value shape this
                                        // editor doesn't support (e.g. from an AAC-authored default),
                                        // which would otherwise dead-end with Save disabled.
                                        setRule((current) =>
                                            sanitizeRuleForEditing(
                                                { ...current, conditions: activeSemantic.conditions },
                                                isDateTarget(selectedTarget),
                                            ),
                                        );
                                    }
                                    setWantsDefault(nextUseDefault);
                                }}
                                label={intl.formatMessage(conditionalFormattingMessages.dialogUseDefaultRule)}
                            />
                            <InfoTooltip
                                text={intl.formatMessage(
                                    conditionalFormattingMessages.dialogUseDefaultRuleInfo,
                                )}
                            />
                        </div>
                    ) : null}
                    <fieldset
                        disabled={locked}
                        className={cx("gd-cf-dialog__editable", {
                            "gd-cf-dialog__editable--readonly": locked,
                        })}
                    >
                        <ReorderList
                            items={displayRule.conditions}
                            getKey={(condition) => condition.id}
                            onReorder={reorderConditions}
                            disabled={locked}
                            renderItem={(condition, slot) => (
                                <ConditionEditor
                                    condition={condition}
                                    kind={rule.target.kind}
                                    isPercent={isPercent}
                                    separators={separators}
                                    suggestions={suggestions}
                                    date={selectedTarget?.date}
                                    dateFilterOptions={dateFilterOptions}
                                    dateSettings={dateSettings}
                                    removable={displayRule.conditions.length > 1}
                                    slot={slot}
                                    readOnly={locked}
                                    onChange={(next) => updateCondition(condition.id, next)}
                                    onRemove={() => removeCondition(condition.id)}
                                />
                            )}
                        />
                        {locked ? null : (
                            <Button
                                className="gd-button-secondary gd-cf-dialog__add-condition"
                                iconLeft="gd-icon-plus"
                                value={intl.formatMessage(conditionalFormattingMessages.dialogAddCondition)}
                                onClick={addCondition}
                            />
                        )}
                    </fieldset>
                </div>
                <div className="gd-cf-dialog__footer">
                    {showDelete ? (
                        <DisabledBubbleMessage
                            className="gd-cf-dialog__delete"
                            showDisabledMessage={deleteDisabled}
                            messageId={conditionalFormattingMessages.dialogRuleCannotBeDeleted.id}
                        >
                            <UiIconButton
                                icon="trash"
                                size="small"
                                variant="tertiary"
                                isDesctructive
                                isDisabled={deleteDisabled}
                                label={intl.formatMessage(conditionalFormattingMessages.ruleDelete)}
                                onClick={() => {
                                    onDelete?.();
                                    onClose();
                                }}
                            />
                        </DisabledBubbleMessage>
                    ) : null}
                    <Button
                        className="gd-button-secondary"
                        value={intl.formatMessage(conditionalFormattingMessages.dialogCancel)}
                        onClick={onClose}
                    />
                    <Button
                        className="gd-button-action"
                        value={intl.formatMessage(conditionalFormattingMessages.dialogSave)}
                        disabled={usingDefault ? false : !complete || !isDirty}
                        onClick={() => {
                            if (usingDefault) {
                                // Revert (not delete-this-one): clears every rule already stored
                                // against the CURRENT target, plus this rule's own id — needed
                                // together because a retarget-then-revert (no fixedTarget) means
                                // the rule being edited may still sit under its OLD target in
                                // `rules`, not yet the one now selected in this draft. Gated on
                                // `isNew` alone, deliberately NOT on `deleteDisabled` — `onDelete` and
                                // `onRevertToDefault` are independent optional props, and tying revert
                                // eligibility to whether a delete callback happens to be provided
                                // would silently skip a valid revert for a caller that only wired one.
                                if (!isNew) {
                                    onRevertToDefault?.(rule.target, rule.id);
                                }
                                onClose();
                                return;
                            }
                            // A dialog opened straight from a semantic row (`semanticRuleFor`) still
                            // carries that display-only synthetic id — give it a real one the instant
                            // it's actually persisted, exactly like every other freshly authored rule.
                            onSave(isNew ? { ...rule, id: uuid() } : rule);
                        }}
                    />
                </div>
            </div>
        </Overlay>
    );
}
