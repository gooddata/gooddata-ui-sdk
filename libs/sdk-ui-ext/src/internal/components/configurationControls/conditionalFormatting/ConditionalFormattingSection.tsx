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
    isSuppressedTarget,
    newRule,
    semanticRuleFor,
    targetIcon,
    targetLocalId,
    targetToValue,
    withSuppressedTargets,
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
    /**
     * Whether insight-level (authored) rules can apply at all — mirrors
     * `isConditionalFormattingEnabled` in PluggablePivotTableNext.tsx. When `false`, the master
     * toggle, "Add rule" button, and any authored rule list are hidden entirely: those controls edit
     * `properties.controls.conditionalFormatting`, which the engine ignores while this is off, so
     * showing them would let a user "author" formatting that silently never paints. The semantic
     * block is unaffected — it has its own independent flag below. Defaults to `true` (existing
     * behavior): most callers only ever render this section when insight-level CF is on.
     */
    enableConditionalFormatting?: boolean;
    /**
     * Mirrors the engine's own `enableSemanticConditionalFormatting` (set in
     * PluggablePivotTableNext.tsx from the same setting, by design, today) — a distinct prop rather
     * than an assumption baked into this component, so the "From semantic layer" block can't drift
     * out of sync with what the table actually paints if semantic inheritance ever gets its own flag.
     * Defaults to `false`: never show inherited rows the caller hasn't confirmed the engine will paint.
     */
    enableSemanticConditionalFormatting?: boolean;
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
    editLabel: string;
    toggleAriaLabel: string;
    /** Custom-with-zero-rules for this target (`suppressedTargets` entry) — formatting is suppressed. */
    off: boolean;
    onToggleOff: (off: boolean) => void;
    onEdit: () => void;
}

// A held-open semantic dialog is a snapshot from when "View" was clicked — re-derive it against the
// current semantic payload every render so it tracks edits, and disappears (rather than showing stale
// or unrelated rules) once the target stops being Inherited (an authored rule appeared elsewhere,
// making the target genuinely Custom) or the target itself is no longer part of the insight at all
// (removed from its bucket — there's nothing left for a Save to even target). Deliberately does NOT
// also close it just because the semantic DEFAULT vanished while the target itself is still there
// (catalog rule removed, a data-view blip) — the dialog's own wantsDefault-recovery logic
// (ConditionalFormattingDialog.tsx) already handles that gracefully (unlocks, falls back to whatever's
// in the draft); unmounting it here first would discard an edit made after unchecking "Use default
// rule" before that logic ever runs. `targetData.semantic` is kept stable across loading transitions
// so isCustomTarget/target-presence below are the only things that fire on a re-execution, not every
// one of them.
function resolveActiveDialog(
    dialog: IDialogState | null,
    semanticMap: Record<string, ISemanticConditionalFormatting>,
    config: IConditionalFormatting | undefined,
    targetOptions: readonly ITargetOption[],
): IDialogState | null {
    if (dialog?.kind !== "semantic") {
        return dialog;
    }
    if (isCustomTarget(config, dialog.option.target)) {
        return null;
    }
    const value = targetToValue(dialog.option.target);
    if (!targetOptions.some((option) => targetToValue(option.target) === value)) {
        return null;
    }
    const current = semanticMap[targetLocalId(dialog.option.target)];
    return current
        ? { kind: "semantic", option: dialog.option, rule: semanticRuleFor(dialog.option, current) }
        : dialog;
}

// Just the (target-based, per semanticRuleFor) id — no need to key on content too: the dialog is
// handed the live `semanticByTarget` map and re-derives the current semantic conditions from it every
// render (via `displayRule`), so a semantic-rule update while the dialog is open shows up without a
// remount. Keying on content as well would risk discarding an in-progress unchecked-and-editing draft
// if fresh data happened to arrive mid-edit.
function dialogKey(dialog: IDialogState): string {
    return dialog.rule.id;
}

// No drag handle, no delete row here — the target's own dialog (opened via Edit) carries the
// "Use default rule" checkbox that switches it to Custom. The row itself only ever offers the
// on/off toggle (`suppressedTargets` suppression) and, while on, a way to open that dialog.
function SemanticRuleRow({
    option,
    editLabel,
    toggleAriaLabel,
    off,
    onToggleOff,
    onEdit,
}: ISemanticRuleRowProps) {
    return (
        <div className={cx("gd-cf-rule", "gd-cf-rule--semantic", { "gd-cf-rule--off": off })}>
            <label className="input-checkbox-toggle s-checkbox-toggle-label gd-cf-rule__toggle">
                <input
                    aria-label={toggleAriaLabel}
                    type="checkbox"
                    checked={!off}
                    onChange={(e) => onToggleOff(!e.target.checked)}
                    className={`s-checkbox-toggle ${off ? "s-disabled" : "s-enabled"}`}
                />
                <span className="input-label-text" />
            </label>
            <span
                className={`gd-cf-type-icon ${targetIcon(option.target.kind, isDateTarget(option))}`}
                aria-hidden="true"
            />
            <span className="gd-cf-rule__title">{option.title}</span>
            {off ? null : (
                <Button className="gd-button-link gd-cf-rule__view" value={editLabel} onClick={onEdit} />
            )}
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
    enableConditionalFormatting = true,
    enableSemanticConditionalFormatting = false,
}: IConditionalFormattingSectionProps) {
    const intl = useIntl();
    const [dialog, setDialog] = useState<IDialogState | null>(null);

    const config: IConditionalFormatting | undefined = properties?.controls?.["conditionalFormatting"];
    const rules = config?.rules ?? [];
    const enabled = config?.enabled ?? false;
    const targetOptions = insight ? buildTargetOptions(insight, targetData) : [];
    // Only date pickers consume the catalog — skip the backend query when no target is date-eligible.
    const dateFilterOptions = useCfDateFilterOptions(backend, workspace, targetOptions.some(isDateTarget));
    const semanticMap = targetData?.semantic ?? {};
    // Targets with a semantic-layer rule, minus any that have their own authored rule (those render
    // as a RuleChip above instead). A `suppressedTargets`-suppressed target still renders here (tagged
    // `off`) — it needs a row to turn back on. NOT gated on the toggle above: the engine's `enabled`
    // only ever deactivates the insight's OWN authored rules — an untouched (Inherited) target keeps
    // painting regardless, so hiding it here would desync the panel from what's on screen. IS gated
    // on `enableSemanticConditionalFormatting`, for the opposite reason: an inherited row the engine
    // won't actually paint (flag off) would be the desync the paragraph above is trying to avoid. ALSO
    // gated on `semanticFresh`: unlike an already-open dialog (which the user is already looking at
    // and which the dialog's own recovery logic protects), a brand-new row opened from a stale map
    // could let the user View/suppress/customize a rule that's about to be superseded — offer no new
    // ones while the map is confirmed stale, rather than only guarding the persistence side.
    const semanticRows =
        enableSemanticConditionalFormatting && targetData?.semanticFresh !== false
            ? targetOptions.flatMap((option) => {
                  const rule = semanticMap[targetLocalId(option.target)];
                  const value = targetToValue(option.target);
                  // When insight-level CF is off, the engine never sees `rules` at all (the renderer
                  // passes it `undefined`) — every target resolves as Inherited regardless of what's
                  // still sitting in persisted properties, so a stale authored rule must not hide the
                  // semantic row here either, or the panel would show nothing for a target the table
                  // is actually painting.
                  const hasAuthoredRule =
                      enableConditionalFormatting &&
                      rules.some((existing) => targetToValue(existing.target) === value);
                  if (!rule || hasAuthoredRule) {
                      return [];
                  }
                  return [{ option, semantic: rule, off: isSuppressedTarget(config, option.target) }];
              })
            : [];
    const activeDialog = resolveActiveDialog(dialog, semanticMap, config, targetOptions);
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

    const commit = (
        rulesNext: readonly IConditionalFormattingRule[],
        enabledNext: boolean,
        suppressedTargetsNext = config?.suppressedTargets,
    ) => {
        // An entry with no live semantic rule behind it (the catalog's rule was itself removed or
        // detached elsewhere) suppresses nothing and can never resurface in the panel to be turned
        // back on — drop it opportunistically on any edit rather than leaving it to accumulate
        // forever. Guarded three ways: before the first data view, an empty/absent map means "unknown
        // yet", not "confirmed gone"; `semanticFresh === false` means the map still belongs to a
        // superseded execution (deliberately NOT gated on `isLoading` instead, which can already read
        // false before a fresh data view actually lands, or never, if that execution fails — the gap
        // `semanticFresh` is specifically tracked to close, see ICfTargetData's doc); and a target
        // temporarily missing from `targetOptions` itself (e.g. removed from the bucket, not from the
        // catalog) is left untouched — its semantic entry being absent from THIS execution says
        // nothing about whether its catalog rule still exists, only that it wasn't queried this time.
        const prunedSuppressedTargets =
            targetData?.semanticFresh === false || targetData?.semantic === undefined
                ? suppressedTargetsNext
                : suppressedTargetsNext?.filter((target) => {
                      const value = targetToValue(target);
                      const inCurrentExecution = targetOptions.some(
                          (option) => targetToValue(option.target) === value,
                      );
                      return !inCurrentExecution || semanticMap[targetLocalId(target)] !== undefined;
                  });
        // Spread the existing config so version (and any future cross-stack fields) survive an edit.
        const next: IConditionalFormatting = withSuppressedTargets(
            { ...config, enabled: enabledNext, rules: rulesNext },
            prunedSuppressedTargets,
        );
        const cloned = cloneDeep(properties ?? {});
        set(cloned, "controls.conditionalFormatting", next);
        pushData?.({ properties: cloned });
    };

    // The one place that edits `suppressedTargets` membership for a single target — every other commit
    // path that touches it (turning suppression on/off, reverting to Inherited, deleting a rule that
    // leaves a stale entry behind) funnels through here instead of hand-rolling the same add/remove
    // filter, so `rulesNext` is the only thing each caller still has to think about for itself.
    const setTargetMode = (
        target: IConditionalFormattingRule["target"],
        mode: "inherited" | "off",
        rulesNext: readonly IConditionalFormattingRule[] = rules,
    ) => {
        const value = targetToValue(target);
        const suppressedTargets = config?.suppressedTargets ?? [];
        const suppressedTargetsNext =
            mode === "off"
                ? suppressedTargets.some((existing) => targetToValue(existing) === value)
                    ? suppressedTargets
                    : [...suppressedTargets, target]
                : suppressedTargets.filter((existing) => targetToValue(existing) !== value);
        commit(rulesNext, enabled, suppressedTargetsNext);
    };

    // Turn a still-Inherited target off (Custom-with-zero-rules, per the engine's suppression
    // convention) or back on — never touches `rules`, only `suppressedTargets` membership.
    const setSuppressed = (target: IConditionalFormattingRule["target"], suppressed: boolean) =>
        setTargetMode(target, suppressed ? "off" : "inherited");

    const saveRule = (rule: IConditionalFormattingRule, isNew: boolean) => {
        const rulesNext = isNew
            ? [...rules, rule]
            : rules.map((existing) => (existing.id === rule.id ? rule : existing));
        // Enable on save for a freshly authored rule so it takes effect without a second click; when
        // editing an existing rule, preserve the current toggle (don't silently re-enable).
        commit(rulesNext, isNew ? true : enabled);
        setDialog(null);
    };

    // Also strips the deleted rule's target from `suppressedTargets`, in case it's stale-listed there
    // too (e.g. externally-authored data, or a target once suppressed then later given its own
    // rule without cleanup) — otherwise the target would stay Custom-with-zero-rules (Off) instead
    // of reverting to Inherited once its last rule is gone, contradicting decision 4's "free
    // consequence" and the "Use default rule" revert flow this also backs.
    const deleteRule = (id: string) => {
        const rulesNext = rules.filter((rule) => rule.id !== id);
        const target = rules.find((rule) => rule.id === id)?.target;
        if (target) {
            setTargetMode(target, "inherited", rulesNext);
        } else {
            commit(rulesNext, enabled);
        }
    };

    // Distinct from `deleteRule`: a target can have several stacked custom rules (the Add flow
    // doesn't prevent authoring more than one against the same target), so reverting it to
    // Inherited must clear ALL of them — deleting just the one open in the dialog would leave the
    // rest still marking the target Custom in `resolvePerTargetConditionalFormatting`. Also clears
    // `ruleId` specifically (regardless of what target it's currently stored under) so a
    // retarget-then-revert doesn't strand the edited rule under its original target.
    const revertToInherited = (target: IConditionalFormattingRule["target"], ruleId: string) => {
        const value = targetToValue(target);
        const rulesNext = rules.filter((rule) => rule.id !== ruleId && targetToValue(rule.target) !== value);
        setTargetMode(target, "inherited", rulesNext);
    };

    const chipLabels = {
        invalid: intl.formatMessage(conditionalFormattingMessages.ruleInvalid),
        invalidValue: intl.formatMessage(conditionalFormattingMessages.ruleInvalidValue),
        edit: intl.formatMessage(conditionalFormattingMessages.ruleEdit),
        delete: intl.formatMessage(conditionalFormattingMessages.ruleDelete),
    };
    const editLabel = intl.formatMessage(conditionalFormattingMessages.ruleEdit);

    const dialogIsNew = activeDialog?.kind === "custom" ? activeDialog.isNew : true;
    // A "semantic" dialog's synthetic id never matches anything in `rules` — pass a real callback
    // only when there's an actual rule to delete; the dialog itself (from its own isNew/fixedTarget)
    // decides whether to render a disabled delete affordance for the "nothing authored yet" case,
    // not a no-op we hand it.
    const hasAuthoredRule = activeDialog ? rules.some((rule) => rule.id === activeDialog.rule.id) : false;

    return (
        <ConfigSection
            id={SECTION_ID}
            className="gd-cf-section"
            title={conditionalFormattingMessages.sectionTitle.id}
            propertiesMeta={propertiesMeta}
            properties={properties}
            pushData={pushData}
            canBeToggled={enableConditionalFormatting}
            toggledOn={enabled}
            toggleDisabled={isLoading}
            onToggle={(checked) => commit(rules, checked)}
        >
            {/* Small, stable sibling element the edit popover anchors to (mirrors ColorDropdown's
                trigger-anchored overlay; anchoring to a tiny sibling — not the whole section — keeps
                the overlay's alignment loop convergent). */}
            <span className="s-cf-popover-anchor gd-cf-section__anchor" />
            {enableConditionalFormatting ? (
                <>
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
                </>
            ) : null}

            {semanticRows.length > 0 ? (
                <div className="gd-cf-section__semantic">
                    <div className="gd-cf-section__subcategory">
                        <span className="gd-cf-section__rules-label">
                            {intl.formatMessage(conditionalFormattingMessages.semanticLabel)}
                        </span>
                        <span className="gd-cf-section__divider" />
                    </div>
                    <div className="gd-cf-section__rules">
                        {semanticRows.map(({ option, semantic, off }) => (
                            <SemanticRuleRow
                                key={option.value}
                                option={option}
                                editLabel={editLabel}
                                toggleAriaLabel={intl.formatMessage(
                                    conditionalFormattingMessages.semanticToggleAriaLabel,
                                    { title: option.title },
                                )}
                                off={off}
                                onToggleOff={(nextOff) => setSuppressed(option.target, nextOff)}
                                onEdit={() =>
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
                    isNew={dialogIsNew}
                    fixedTarget={activeDialog.kind === "semantic"}
                    semanticByTarget={semanticMap}
                    targetOptions={targetOptions}
                    separators={separators}
                    dateFilterOptions={dateFilterOptions}
                    dateSettings={dateSettings}
                    alignTo=".s-cf-popover-anchor"
                    onDelete={hasAuthoredRule ? () => deleteRule(activeDialog.rule.id) : undefined}
                    onRevertToDefault={revertToInherited}
                    onSave={(rule) => saveRule(rule, dialogIsNew)}
                    onClose={() => setDialog(null)}
                />
            ) : null}
        </ConfigSection>
    );
}
