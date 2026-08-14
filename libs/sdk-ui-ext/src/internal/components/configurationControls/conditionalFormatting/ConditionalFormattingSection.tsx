// (C) 2026 GoodData Corporation

import { useState } from "react";

import cx from "classnames";
import { cloneDeep, set } from "lodash-es";
import { useIntl } from "react-intl";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type IInsightDefinition,
    type ISemanticConditionalFormatting,
    type ISeparators,
} from "@gooddata/sdk-model";
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
    isCustomTarget,
    isDateTarget,
    isRuleComplete,
    newRule,
    semanticRuleFor,
    targetIcon,
    targetLocalId,
} from "./conditionalFormattingModel.js";
import { type IReorderSlot, ReorderList } from "./ReorderList.js";
import { useCfDateFilterOptions } from "./useCfDateFilterOptions.js";

const SECTION_ID = "conditionalFormatting_section";

// At most one popover can be open against the shared `.s-cf-popover-anchor`; a union makes that
// structural instead of an invariant two independent booleans would have to maintain by hand.
type IDialogState =
    | { kind: "custom"; rule: IConditionalFormattingRule; isNew: boolean }
    | { kind: "semantic"; rule: IConditionalFormattingRule; option: ITargetOption };

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

interface ISemanticRuleRowProps {
    option: ITargetOption;
    viewLabel: string;
    onView: () => void;
}

// A held-open semantic dialog is a snapshot from when "View" was clicked — re-derive it against the
// current semantic payload every render so it tracks edits, and disappears (rather than showing stale
// or unrelated rules) once loading clears `targetData.semantic`, the target stops being Inherited (its
// row left `semanticRows` because it became Custom), or its semantic rule itself is no longer present.
function resolveActiveDialog(
    dialog: IDialogState | null,
    semanticMap: Record<string, ISemanticConditionalFormatting>,
    config: IConditionalFormatting | undefined,
): IDialogState | null {
    if (dialog?.kind !== "semantic") {
        return dialog;
    }
    if (isCustomTarget(config, dialog.option.target)) {
        return null;
    }
    const current = semanticMap[targetLocalId(dialog.option.target)];
    return current
        ? { kind: "semantic", option: dialog.option, rule: semanticRuleFor(dialog.option, current) }
        : null;
}

// `activeDialog.rule.id` alone is stable across a semantic-rule content change (it's target-based, not
// content-based, per semanticRuleFor) — ConditionalFormattingDialog seeds its local draft from `rule` via
// useState and won't re-sync on a prop change, so without remounting on content change too, a rule that
// changes while the (read-only) dialog is open would keep showing what it looked like when opened.
function dialogKey(dialog: IDialogState): string {
    return dialog.kind === "semantic"
        ? `${dialog.rule.id}:${JSON.stringify(dialog.rule.conditions)}`
        : dialog.rule.id;
}

// Read-only: no drag handle, no delete — nothing on the row is editable here, only the View
// button opens the (readOnly) dialog. Turning it off/customizing it is PR-6, not this one.
function SemanticRuleRow({ option, viewLabel, onView }: ISemanticRuleRowProps) {
    return (
        <div className="gd-cf-rule gd-cf-rule--semantic">
            <span
                className={`gd-cf-type-icon ${targetIcon(option.target.kind, isDateTarget(option))}`}
                aria-hidden="true"
            />
            <span className="gd-cf-rule__title">{option.title}</span>
            <Button className="gd-button-link gd-cf-rule__view" value={viewLabel} onClick={onView} />
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
    // Targets inheriting a semantic-layer rule, minus any already Custom (an authored rule or a
    // customTargets entry). NOT gated on the toggle above: the engine's `enabled` only ever
    // deactivates the insight's OWN authored rules — an untouched (Inherited) target keeps
    // painting regardless, so hiding it here would desync the panel from what's on screen.
    const semanticMap = targetData?.semantic ?? {};
    const semanticRows = targetOptions.flatMap((option) => {
        const rule = semanticMap[targetLocalId(option.target)];
        return !rule || isCustomTarget(config, option.target) ? [] : [{ option, semantic: rule }];
    });
    const activeDialog = resolveActiveDialog(dialog, semanticMap, config);
    // `resolveActiveDialog` only hides an invalidated semantic dialog from render — without also
    // clearing the underlying state here, a later data view that happens to carry a rule for the same
    // (possibly stale) target would silently reopen it, with no new View click.
    if (dialog?.kind === "semantic" && activeDialog === null) {
        setDialog(null);
    }
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
    const viewLabel = intl.formatMessage(conditionalFormattingMessages.ruleView);

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
                    onClick={() =>
                        setDialog({ kind: "custom", rule: newRule(targetOptions[0]), isNew: true })
                    }
                />
            </div>
            {rules.length === 0 ? (
                // The empty-state hint would contradict an inherited row rendered just below it.
                semanticRows.length === 0 ? (
                    <div className="gd-cf-section__empty">
                        {intl.formatMessage(conditionalFormattingMessages.empty)}
                    </div>
                ) : null
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
                                    onEdit={() => setDialog({ kind: "custom", rule, isNew: false })}
                                    onDelete={() => deleteRule(rule.id)}
                                />
                            );
                        }}
                    />
                </div>
            )}

            {semanticRows.length > 0 ? (
                <div className="gd-cf-section__semantic">
                    <div className="gd-cf-section__subcategory">
                        <span className="gd-cf-section__rules-label">
                            {intl.formatMessage(conditionalFormattingMessages.semanticLabel)}
                        </span>
                        <span className="gd-cf-section__divider" />
                    </div>
                    <div className="gd-cf-section__rules">
                        {semanticRows.map(({ option, semantic }) => (
                            <SemanticRuleRow
                                key={option.value}
                                option={option}
                                viewLabel={viewLabel}
                                onView={() =>
                                    setDialog({
                                        kind: "semantic",
                                        rule: semanticRuleFor(option, semantic),
                                        option,
                                    })
                                }
                            />
                        ))}
                    </div>
                </div>
            ) : null}

            {activeDialog ? (
                <ConditionalFormattingDialog
                    key={dialogKey(activeDialog)}
                    rule={activeDialog.rule}
                    isNew={activeDialog.kind === "custom" && activeDialog.isNew}
                    readOnly={activeDialog.kind === "semantic"}
                    fixedTarget={activeDialog.kind === "semantic"}
                    targetOptions={targetOptions}
                    separators={separators}
                    dateFilterOptions={dateFilterOptions}
                    dateSettings={dateSettings}
                    alignTo=".s-cf-popover-anchor"
                    onSave={(rule) => activeDialog.kind === "custom" && saveRule(rule, activeDialog.isNew)}
                    onClose={() => setDialog(null)}
                />
            ) : null}
        </ConfigSection>
    );
}
