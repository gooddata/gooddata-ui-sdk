// (C) 2026 GoodData Corporation

import { useState } from "react";

import { cloneDeep, set } from "lodash-es";
import { useIntl } from "react-intl";

import { type IInsightDefinition } from "@gooddata/sdk-model";
import { Button } from "@gooddata/sdk-ui-kit";
import { type IConditionalFormatting, type IConditionalFormattingRule } from "@gooddata/sdk-ui-pivot/next";

import { conditionalFormattingMessages } from "../../../../locales.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { ConfigSection } from "../ConfigSection.js";

import { ConditionalFormattingDialog } from "./ConditionalFormattingDialog.js";
import {
    type ITargetOption,
    buildTargetOptions,
    findTargetOption,
    newRule,
    targetIcon,
    targetLocalId,
} from "./conditionalFormattingModel.js";

const SECTION_ID = "conditionalFormatting_section";

interface IDialogState {
    rule: IConditionalFormattingRule;
    isNew: boolean;
}

export interface IConditionalFormattingSectionProps {
    properties?: IVisualizationProperties;
    propertiesMeta?: Record<string, unknown>;
    insight?: IInsightDefinition;
    titlesByLocalId?: Record<string, string>;
    isLoading?: boolean;
    pushData?: (data: unknown) => void;
}

interface IRuleChipProps {
    rule: IConditionalFormattingRule;
    option: ITargetOption | undefined;
    labels: {
        invalid: string;
        edit: string;
        delete: string;
    };
    onEdit: () => void;
    onDelete: () => void;
}

// A saved rule: its target type icon (ABC / metric) + title; the delete (trash) appears on hover.
// Reorder is preserved as rules-array order (first-match-wins) — drag-to-reorder UI is deferred.
function RuleChip({ rule, option, labels, onEdit, onDelete }: IRuleChipProps) {
    return (
        <div className="gd-cf-rule">
            <button type="button" className="gd-cf-rule__body" onClick={onEdit} title={labels.edit}>
                <span className={`gd-cf-type-icon ${targetIcon(rule.target.kind)}`} aria-hidden="true" />
                <span className="gd-cf-rule__title">
                    {option ? option.title : targetLocalId(rule.target)}
                </span>
                {option ? null : <span className="gd-cf-rule__invalid">{labels.invalid}</span>}
            </button>
            <Button
                className="gd-button-link gd-button-icon-only gd-icon-trash gd-cf-rule__delete"
                accessibilityConfig={{ ariaLabel: labels.delete }}
                onClick={onDelete}
            />
        </div>
    );
}

export function ConditionalFormattingSection({
    properties,
    propertiesMeta,
    insight,
    titlesByLocalId,
    isLoading,
    pushData,
}: IConditionalFormattingSectionProps) {
    const intl = useIntl();
    const [dialog, setDialog] = useState<IDialogState | null>(null);

    const config: IConditionalFormatting | undefined = properties?.controls?.["conditionalFormatting"];
    const rules = config?.rules ?? [];
    const enabled = config?.enabled ?? false;
    const targetOptions = insight ? buildTargetOptions(insight, titlesByLocalId) : [];
    const canAddRule = !isLoading && targetOptions.length > 0;

    const commit = (rulesNext: readonly IConditionalFormattingRule[], enabledNext: boolean) => {
        // Spread the existing config so version (and any future cross-stack fields) survive an edit.
        const next: IConditionalFormatting = { ...config, enabled: enabledNext, rules: rulesNext };
        const cloned = cloneDeep(properties ?? {});
        set(cloned, "controls.conditionalFormatting", next);
        pushData?.({ properties: cloned });
    };

    const saveRule = (rule: IConditionalFormattingRule, isNew: boolean) => {
        const rulesNext = isNew
            ? [...rules, rule]
            : rules.map((existing) => (existing.id === rule.id ? rule : existing));
        // Enable on save for a freshly authored rule so it takes effect without a second click; when
        // editing an existing rule, preserve the current toggle (don't silently re-enable).
        commit(rulesNext, isNew ? true : enabled);
        setDialog(null);
    };

    const deleteRule = (id: string) =>
        commit(
            rules.filter((rule) => rule.id !== id),
            enabled,
        );

    const chipLabels = {
        invalid: intl.formatMessage(conditionalFormattingMessages.ruleInvalid),
        edit: intl.formatMessage(conditionalFormattingMessages.ruleEdit),
        delete: intl.formatMessage(conditionalFormattingMessages.ruleDelete),
    };

    return (
        <ConfigSection
            id={SECTION_ID}
            className="gd-cf-section"
            title={conditionalFormattingMessages.sectionTitle.id}
            propertiesMeta={propertiesMeta}
            properties={properties}
            pushData={pushData}
            canBeToggled
            toggledOn={enabled}
            toggleDisabled={isLoading}
            onToggle={(checked) => commit(rules, checked)}
        >
            {/* Small, stable sibling element the edit popover anchors to (mirrors ColorDropdown's
                trigger-anchored overlay; anchoring to a tiny sibling — not the whole section — keeps
                the overlay's alignment loop convergent). */}
            <span className="s-cf-popover-anchor gd-cf-section__anchor" />
            <div className="gd-cf-section__subcategory">
                <span className="gd-cf-section__rules-label">
                    {intl.formatMessage(conditionalFormattingMessages.rulesLabel)}
                </span>
                <span className="gd-cf-section__divider" />
                <Button
                    className="gd-button-link gd-cf-section__add"
                    iconLeft="gd-icon-plus"
                    value={intl.formatMessage(conditionalFormattingMessages.addRule)}
                    disabled={!canAddRule}
                    onClick={() => setDialog({ rule: newRule(targetOptions[0].target), isNew: true })}
                />
            </div>
            {rules.length === 0 ? (
                <div className="gd-cf-section__empty">
                    {intl.formatMessage(conditionalFormattingMessages.empty)}
                </div>
            ) : (
                <div className="gd-cf-section__rules">
                    {rules.map((rule) => (
                        <RuleChip
                            key={rule.id}
                            rule={rule}
                            option={findTargetOption(targetOptions, rule.target)}
                            labels={chipLabels}
                            onEdit={() => setDialog({ rule, isNew: false })}
                            onDelete={() => deleteRule(rule.id)}
                        />
                    ))}
                </div>
            )}

            {dialog ? (
                <ConditionalFormattingDialog
                    key={dialog.rule.id}
                    rule={dialog.rule}
                    isNew={dialog.isNew}
                    targetOptions={targetOptions}
                    alignTo=".s-cf-popover-anchor"
                    onSave={(rule) => saveRule(rule, dialog.isNew)}
                    onClose={() => setDialog(null)}
                />
            ) : null}
        </ConfigSection>
    );
}
