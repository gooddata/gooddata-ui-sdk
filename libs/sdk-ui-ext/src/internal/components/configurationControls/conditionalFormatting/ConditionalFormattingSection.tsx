// (C) 2026 GoodData Corporation

import { useState } from "react";

import cx from "classnames";
import { cloneDeep, set } from "lodash-es";
import { useIntl } from "react-intl";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IInsightDefinition, type ISeparators } from "@gooddata/sdk-model";
import { Button, UiIconButton } from "@gooddata/sdk-ui-kit";
import { type IConditionalFormatting, type IConditionalFormattingRule } from "@gooddata/sdk-ui-pivot/next";

import { conditionalFormattingMessages } from "../../../../locales.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { ConfigSection } from "../ConfigSection.js";

import { ConditionalFormattingDialog } from "./ConditionalFormattingDialog.js";
import {
    type ICfDateSettings,
    type ICfTargetData,
    type ITargetOption,
    buildTargetOptions,
    findTargetOption,
    isDateTarget,
    isRuleComplete,
    newRule,
    targetIcon,
    targetLocalId,
} from "./conditionalFormattingModel.js";
import { type IReorderSlot, ReorderList } from "./ReorderList.js";
import { useCfDateFilterOptions } from "./useCfDateFilterOptions.js";

const SECTION_ID = "conditionalFormatting_section";

interface IDialogState {
    rule: IConditionalFormattingRule;
    isNew: boolean;
}

export interface IConditionalFormattingSectionProps {
    properties?: IVisualizationProperties;
    propertiesMeta?: Record<string, unknown>;
    insight?: IInsightDefinition;
    targetData?: ICfTargetData;
    /** Backend + workspace for fetching the date-filter preset catalog (date conditions). */
    backend?: IAnalyticalBackend;
    workspace?: string;
    dateSettings?: ICfDateSettings;
    separators?: ISeparators;
    isLoading?: boolean;
    pushData?: (data: unknown) => void;
}

interface IRuleChipProps {
    rule: IConditionalFormattingRule;
    option: ITargetOption | undefined;
    invalid: boolean;
    /** False until execution-resolved target metadata arrives (editing needs it). */
    editable: boolean;
    labels: {
        invalid: string;
        invalidValue: string;
        edit: string;
        delete: string;
    };
    slot: IReorderSlot;
    onEdit: () => void;
    onDelete: () => void;
}

// Array order = evaluation order (first-match-wins).
function RuleChip({ rule, option, invalid, editable, labels, slot, onEdit, onDelete }: IRuleChipProps) {
    return (
        <div className={cx("gd-cf-rule", slot.className)} {...slot.rootProps}>
            {slot.handle}
            <button
                type="button"
                className="gd-cf-rule__body"
                onClick={onEdit}
                title={labels.edit}
                disabled={!editable}
            >
                <span
                    className={`gd-cf-type-icon ${targetIcon(rule.target.kind, isDateTarget(option))}`}
                    aria-hidden="true"
                />
                <span className="gd-cf-rule__title">
                    {option ? option.title : targetLocalId(rule.target)}
                </span>
                {invalid ? (
                    <span className="gd-cf-rule__invalid">
                        {option ? labels.invalidValue : labels.invalid}
                    </span>
                ) : null}
            </button>
            <span className="gd-cf-rule__delete">
                <UiIconButton
                    icon="trash"
                    size="small"
                    variant="tertiary"
                    isDesctructive
                    label={labels.delete}
                    onClick={onDelete}
                />
            </span>
        </div>
    );
}

export function ConditionalFormattingSection({
    properties,
    propertiesMeta,
    insight,
    targetData,
    backend,
    workspace,
    dateSettings,
    separators,
    isLoading,
    pushData,
}: IConditionalFormattingSectionProps) {
    const intl = useIntl();
    const [dialog, setDialog] = useState<IDialogState | null>(null);

    const config: IConditionalFormatting | undefined = properties?.controls?.["conditionalFormatting"];
    const rules = config?.rules ?? [];
    const enabled = config?.enabled ?? false;
    const targetOptions = insight ? buildTargetOptions(insight, targetData) : [];
    // Only date pickers consume the catalog — skip the backend query when no target is date-eligible.
    const dateFilterOptions = useCfDateFilterOptions(backend, workspace, targetOptions.some(isDateTarget));
    // Completeness and authoring both need execution-resolved date metadata; before the first data view
    // it's unknown — don't flash a false "Invalid" badge, don't author a plain-text rule on a date attr.
    const targetDataReady = targetData?.dates !== undefined;
    const canAddRule = !isLoading && targetOptions.length > 0 && targetDataReady;

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
        invalidValue: intl.formatMessage(conditionalFormattingMessages.ruleInvalidValue),
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
                    onClick={() => setDialog({ rule: newRule(targetOptions[0]), isNew: true })}
                />
            </div>
            {rules.length === 0 ? (
                <div className="gd-cf-section__empty">
                    {intl.formatMessage(conditionalFormattingMessages.empty)}
                </div>
            ) : (
                <div className="gd-cf-section__rules">
                    <ReorderList
                        items={rules}
                        getKey={(rule) => rule.id}
                        onReorder={(next) => commit(next, enabled)}
                        renderItem={(rule, slot) => {
                            const option = findTargetOption(targetOptions, rule.target);
                            // A missing target flags immediately; value validation waits for date metadata.
                            const invalid =
                                !option || (targetDataReady && !isRuleComplete(rule, option.date));
                            return (
                                <RuleChip
                                    rule={rule}
                                    option={option}
                                    invalid={invalid}
                                    editable={targetDataReady}
                                    labels={chipLabels}
                                    slot={slot}
                                    onEdit={() => setDialog({ rule, isNew: false })}
                                    onDelete={() => deleteRule(rule.id)}
                                />
                            );
                        }}
                    />
                </div>
            )}

            {dialog ? (
                <ConditionalFormattingDialog
                    key={dialog.rule.id}
                    rule={dialog.rule}
                    isNew={dialog.isNew}
                    targetOptions={targetOptions}
                    separators={separators}
                    dateFilterOptions={dateFilterOptions}
                    dateSettings={dateSettings}
                    alignTo=".s-cf-popover-anchor"
                    onSave={(rule) => saveRule(rule, dialog.isNew)}
                    onClose={() => setDialog(null)}
                />
            ) : null}
        </ConfigSection>
    );
}
