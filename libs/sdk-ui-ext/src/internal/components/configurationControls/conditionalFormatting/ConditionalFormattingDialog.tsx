// (C) 2026 GoodData Corporation

import { useState } from "react";

import { useIntl } from "react-intl";

import { type ISeparators } from "@gooddata/sdk-model";
import { Button, type IAlignPoint, Overlay } from "@gooddata/sdk-ui-kit";
import {
    type IConditionalFormattingCondition,
    type IConditionalFormattingRule,
} from "@gooddata/sdk-ui-pivot/next";

import { conditionalFormattingMessages } from "../../../../locales.js";

import { CfSelect } from "./CfSelect.js";
import {
    type ITargetOption,
    findTargetOption,
    isRuleComplete,
    newCondition,
    ruleWithTarget,
    sanitizeRuleForEditing,
    targetIcon,
} from "./conditionalFormattingModel.js";
import { ConditionEditor } from "./ConditionEditor.js";
import { ReorderList } from "./ReorderList.js";

// The config panel sits on the right edge of the screen, so open the popover to the LEFT of the
// anchor (self's right edge to the anchor's left edge); fall back to the right when there's no room.
const POPOVER_ALIGN_POINTS: IAlignPoint[] = [
    { align: "cl cr", offset: { x: -5, y: 0 } },
    { align: "cr cl", offset: { x: 5, y: 0 } },
];

export interface IConditionalFormattingDialogProps {
    rule: IConditionalFormattingRule;
    isNew: boolean;
    targetOptions: ITargetOption[];
    /** Workspace number separators; measure value inputs validate and format with them. */
    separators?: ISeparators;
    /** CSS selector of a small, stable element the popover anchors to. */
    alignTo: string;
    onSave: (rule: IConditionalFormattingRule) => void;
    onClose: () => void;
}

export function ConditionalFormattingDialog({
    rule: initialRule,
    isNew,
    targetOptions,
    separators,
    alignTo,
    onSave,
    onClose,
}: IConditionalFormattingDialogProps) {
    const intl = useIntl();
    const [rule, setRule] = useState(() => sanitizeRuleForEditing(initialRule));

    const updateCondition = (id: string, next: IConditionalFormattingCondition) =>
        setRule((current) => ({
            ...current,
            conditions: current.conditions.map((condition) => (condition.id === id ? next : condition)),
        }));

    const removeCondition = (id: string) =>
        setRule((current) => ({
            ...current,
            conditions: current.conditions.filter((condition) => condition.id !== id),
        }));

    const addCondition = () =>
        setRule((current) => ({ ...current, conditions: [...current.conditions, newCondition()] }));

    const reorderConditions = (conditions: IConditionalFormattingCondition[]) =>
        setRule((current) => ({ ...current, conditions }));

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
    const isPercent = selectedTarget?.isPercent ?? false;
    const suggestions = selectedTarget?.elements ?? [];
    const complete = isRuleComplete(rule);
    const title = intl.formatMessage(
        isNew ? conditionalFormattingMessages.dialogAddTitle : conditionalFormattingMessages.dialogEditTitle,
    );

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
                    <CfSelect
                        value={selectedTarget?.value}
                        items={targetOptions.map((option) => ({
                            value: option.value,
                            title: option.title,
                            icon: targetIcon(option.target.kind),
                        }))}
                        onSelect={changeTarget}
                        placeholder={intl.formatMessage(conditionalFormattingMessages.dialogSelectTarget)}
                    />
                    <ReorderList
                        items={rule.conditions}
                        getKey={(condition) => condition.id}
                        onReorder={reorderConditions}
                        renderItem={(condition, slot) => (
                            <ConditionEditor
                                condition={condition}
                                kind={rule.target.kind}
                                isPercent={isPercent}
                                separators={separators}
                                suggestions={suggestions}
                                removable={rule.conditions.length > 1}
                                slot={slot}
                                intl={intl}
                                onChange={(next) => updateCondition(condition.id, next)}
                                onRemove={() => removeCondition(condition.id)}
                            />
                        )}
                    />
                    <Button
                        className="gd-button-secondary gd-cf-dialog__add-condition"
                        iconLeft="gd-icon-plus"
                        value={intl.formatMessage(conditionalFormattingMessages.dialogAddCondition)}
                        onClick={addCondition}
                    />
                </div>
                <div className="gd-cf-dialog__footer">
                    <Button
                        className="gd-button-secondary"
                        value={intl.formatMessage(conditionalFormattingMessages.dialogCancel)}
                        onClick={onClose}
                    />
                    <Button
                        className="gd-button-action"
                        value={intl.formatMessage(conditionalFormattingMessages.dialogSave)}
                        disabled={!complete}
                        onClick={() => onSave(rule)}
                    />
                </div>
            </div>
        </Overlay>
    );
}
