// (C) 2026 GoodData Corporation

import { type ChangeEvent, type ReactNode, useId, useMemo, useRef, useState } from "react";

import { useIntl } from "react-intl";

import {
    type FeatureFlagOverrideRule,
    type IFeatureFlagOverrideContext,
    type IStaleFeatureFlagOverrideRule,
    type IStoredFeatureFlagOverrides,
    type OverridableFeatureFlag,
    getServerFeatureFlags,
    isFeatureFlagOverrideRuleInContext,
    parseFeatureFlagOverrides,
    selectFeatureFlagOverrideRules,
    serializeFeatureFlagOverrides,
    writeFeatureFlagOverrides,
} from "@gooddata/sdk-backend-tiger";
import { type ISettings } from "@gooddata/sdk-model";
import {
    Message,
    UiButton,
    UiButtonSegmentedControl,
    UiDialogBody,
    UiDialogFooter,
    UiDialogHeader,
    UiModalDialog,
    UiSectionHeading,
    UiTextInput,
} from "@gooddata/sdk-ui-kit";

import { FeatureFlagJsonDetail } from "./FeatureFlagJsonDetail.js";
import { FeatureFlagOverrideRow } from "./FeatureFlagOverrideRow.js";
import { b, e } from "./featureFlagOverridesBem.js";
import {
    OtherPageRuleRow,
    StaleRuleRow,
    getStaleRuleFlag,
    useSavedRuleLabels,
} from "./FeatureFlagSavedRuleRows.js";
import { type IScopeNames } from "./FeatureFlagScopeDropdown.js";
import { type IFeatureFlagValueHint } from "./FeatureFlagValueEditor.js";
import { formatFlagValue } from "./FeatureFlagValueText.js";
import {
    DEFAULT_OVERRIDE_TARGET,
    type IOverrideTarget,
    OVERRIDABLE_FLAGS,
    type OverrideScope,
    type OverrideValue,
    countChangedRules,
    countChangedStaleRules,
    createRule,
    formatDraftText,
    getFlagType,
    getOverriddenFlags,
    getRuleConditions,
    getTargetConditions,
    isEffectiveMove,
    isSameRuleAndValue,
    isSameValue,
    isSetInCode,
    isValidDraftText,
    moveRule,
    parseDraftText,
    removeRule,
    upsertRule,
} from "./overrideRules.js";
import { useWorkspaceTitle } from "./useWorkspaceTitle.js";

export interface IFeatureFlagOverridesPanelProps {
    stored: IStoredFeatureFlagOverrides;
    context: IFeatureFlagOverrideContext;
    organizationTitle?: string;
    userName: string;
    settings: ISettings;
    initialOverriddenOnly?: boolean;
    onClose: () => void;
    onApplied: () => void;
}

const EXPORT_FILE_NAME = "feature-flag-overrides.json";

type ErrorMessageId = "featureFlagOverrides.error.write" | "featureFlagOverrides.error.importUnreadable";

type FlagSet = ReadonlySet<OverridableFeatureFlag>;

interface IRowHints {
    hint?: IFeatureFlagValueHint;
    badge?: string;
}
type Drafts = Partial<Record<OverridableFeatureFlag, string>>;

export function FeatureFlagOverridesPanel({
    stored,
    context,
    organizationTitle,
    userName,
    settings,
    initialOverriddenOnly = false,
    onClose,
    onApplied,
}: IFeatureFlagOverridesPanelProps) {
    const intl = useIntl();
    const idPrefix = useId();
    const importInputRef = useRef<HTMLInputElement>(null);
    const [rules, setRules] = useState<FeatureFlagOverrideRule[]>(stored.rules);
    const [staleRules, setStaleRules] = useState<IStaleFeatureFlagOverrideRule[]>(stored.staleRules);
    const [isUnreadable, setIsUnreadable] = useState(stored.unreadableContent !== undefined);
    const [drafts, setDrafts] = useState<Drafts>({});
    const [expandedFlags, setExpandedFlags] = useState<FlagSet>(new Set());
    const [overriddenSnapshot, setOverriddenSnapshot] = useState(() =>
        getOverriddenFlags(stored.rules, context),
    );
    const [search, setSearch] = useState("");
    const [overriddenOnly, setOverriddenOnly] = useState(initialOverriddenOnly);
    const [errorMessageId, setErrorMessageId] = useState<ErrorMessageId>();

    const [serverFlags] = useState(() => getServerFeatureFlags(context.workspaceId));
    const workspaceTitle = useWorkspaceTitle(context.workspaceId);
    const scopeNames: IScopeNames = {
        organization: organizationTitle || context.organizationId,
        workspace: workspaceTitle || context.workspaceId,
    };
    const appliedRules = useMemo(() => selectFeatureFlagOverrideRules(rules, context), [rules, context]);
    const storedAppliedRules = useMemo(
        () => selectFeatureFlagOverrideRules(stored.rules, context),
        [stored, context],
    );
    const liveOverriddenFlags = useMemo(() => getOverriddenFlags(rules, context), [rules, context]);
    const pendingCount = useMemo(
        () => countChangedRules(stored.rules, rules) + countChangedStaleRules(stored.staleRules, staleRules),
        [stored, rules, staleRules],
    );
    // Applying also replaces unreadable storage, which the draft no longer shows after Clear all.
    const hasChangesToApply = pendingCount > 0 || stored.unreadableContent !== undefined;
    const scopes: OverrideScope[] = context.workspaceId
        ? ["everywhere", "organization", "workspace"]
        : ["everywhere", "organization"];

    const invalidFlags = new Set(
        OVERRIDABLE_FLAGS.filter((flag) => {
            const text = drafts[flag];
            return text !== undefined && !isValidDraftText(flag, text);
        }),
    );

    const isOnThisPage = (rule: FeatureFlagOverrideRule) => isFeatureFlagOverrideRuleInContext(rule, context);
    const otherPageRules = rules.filter((rule) => !isOnThisPage(rule));
    const hasSavedRules = (flag: OverridableFeatureFlag) =>
        rules.some((rule) => rule.flag === flag && isOnThisPage(rule));

    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch = (flag: string) => flag.toLowerCase().includes(normalizedSearch);
    const visibleFlags = OVERRIDABLE_FLAGS.filter(
        (flag) =>
            invalidFlags.has(flag) ||
            (matchesSearch(flag) &&
                (!overriddenOnly || overriddenSnapshot.has(flag) || liveOverriddenFlags.has(flag))),
    );
    const savedRuleLabels = useSavedRuleLabels({
        rules: otherPageRules,
        context,
        organizationTitle,
        workspaceTitle,
        userName,
    });

    const replaceDraft = (next: Pick<IStoredFeatureFlagOverrides, "rules" | "staleRules">) => {
        setRules(next.rules);
        setStaleRules(next.staleRules);
        setIsUnreadable(false);
        setDrafts({});
        setExpandedFlags(new Set());
        setOverriddenSnapshot(getOverriddenFlags(next.rules, context));
        setErrorMessageId(undefined);
    };

    const writeValue = (flag: OverridableFeatureFlag, value: unknown) => {
        const appliedRule = appliedRules.get(flag);
        const conditions = appliedRule
            ? getRuleConditions(appliedRule)
            : getTargetConditions(DEFAULT_OVERRIDE_TARGET, context);
        const rule = createRule({ flag, value, conditions });
        if (rule) {
            setRules((current) => upsertRule(current, rule));
        }
    };

    const handleValueChange = (flag: OverridableFeatureFlag, value: OverrideValue) => {
        writeValue(flag, value);
    };

    const handleTextChange = (flag: OverridableFeatureFlag, text: string) => {
        setDrafts((current) => ({ ...current, [flag]: text }));
        if (isValidDraftText(flag, text)) {
            writeValue(flag, parseDraftText(flag, text));
        }
    };

    const handleTargetChange = (flag: OverridableFeatureFlag, target: IOverrideTarget) => {
        const appliedRule = appliedRules.get(flag);
        if (appliedRule) {
            setRules((current) => moveRule(current, appliedRule, getTargetConditions(target, context)));
        }
    };

    const isEffectiveTarget = (flag: OverridableFeatureFlag, target: IOverrideTarget) => {
        const appliedRule = appliedRules.get(flag);
        return appliedRule !== undefined && isEffectiveMove({ rules, rule: appliedRule, target, context });
    };

    const handleReset = (flag: OverridableFeatureFlag) => {
        const appliedRule = appliedRules.get(flag);
        if (isSetInCode(flag)) {
            setRules((current) => current.filter((rule) => rule.flag !== flag || !isOnThisPage(rule)));
        } else if (appliedRule) {
            setRules((current) => removeRule(current, appliedRule));
        }
        setDrafts(({ [flag]: _removed, ...rest }) => rest);
    };

    const handleExpandedChange = (flag: OverridableFeatureFlag, isExpanded: boolean) => {
        setExpandedFlags((current) => {
            const next = new Set(current);
            if (isExpanded) {
                next.add(flag);
            } else {
                next.delete(flag);
            }
            return next;
        });
    };

    const handleApply = () => {
        if (writeFeatureFlagOverrides({ rules, staleRules })) {
            onApplied();
        } else {
            setErrorMessageId("featureFlagOverrides.error.write");
        }
    };

    const handleExport = () => {
        const url = URL.createObjectURL(
            new Blob([serializeFeatureFlagOverrides({ rules, staleRules: [] })], {
                type: "application/json",
            }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = EXPORT_FILE_NAME;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 0);
    };

    const handleImportFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) {
            return;
        }
        const showUnreadable = () => setErrorMessageId("featureFlagOverrides.error.importUnreadable");
        void file
            .text()
            .then((content) => {
                const imported = parseFeatureFlagOverrides(content);
                if (imported.unreadableContent === undefined) {
                    replaceDraft(imported);
                } else {
                    showUnreadable();
                }
            })
            .catch(showUnreadable);
    };

    const getRowHints = (flag: OverridableFeatureFlag): IRowHints => {
        if (invalidFlags.has(flag)) {
            const id =
                getFlagType(flag) === "NUMBER"
                    ? "featureFlagOverrides.value.invalidNumber"
                    : "featureFlagOverrides.value.invalidJson";
            return { hint: { isError: true, text: intl.formatMessage({ id }) } };
        }
        if (isSetInCode(flag)) {
            return hasSavedRules(flag)
                ? {
                      hint: {
                          isError: false,
                          text: intl.formatMessage({ id: "featureFlagOverrides.value.savedOverrideInCode" }),
                      },
                  }
                : {};
        }
        const appliedRule = appliedRules.get(flag);
        return { badge: getBadge(flag), hint: getOverrideSummary(flag, appliedRule) };
    };

    const getBadge = (flag: OverridableFeatureFlag): string | undefined => {
        const storedRule = storedAppliedRules.get(flag);
        if (!isSameRuleAndValue(appliedRules.get(flag), storedRule)) {
            return intl.formatMessage({ id: "featureFlagOverrides.value.notApplied" });
        }
        if (!storedRule || isSameValue(storedRule.value, settings[flag])) {
            return undefined;
        }
        return getFlagType(flag) === "JSON"
            ? intl.formatMessage({ id: "featureFlagOverrides.value.pageUsesDifferent" })
            : intl.formatMessage(
                  { id: "featureFlagOverrides.value.pageUses" },
                  { value: formatFlagValue(intl, settings[flag]) },
              );
    };

    const getOverrideSummary = (
        flag: OverridableFeatureFlag,
        appliedRule: FeatureFlagOverrideRule | undefined,
    ): IFeatureFlagValueHint | undefined => {
        if (getFlagType(flag) !== "JSON" || !appliedRule) {
            return undefined;
        }
        const summary = formatFlagValue(intl, appliedRule.value);
        return summary === formatFlagValue(intl, serverFlags?.[flag])
            ? undefined
            : { isError: false, text: summary };
    };

    const renderFlag = (flag: OverridableFeatureFlag) => {
        const appliedRule = appliedRules.get(flag);
        const isLocked = isSetInCode(flag);
        const editorValue = appliedRule && !isLocked ? appliedRule.value : settings[flag];
        const isExpanded = expandedFlags.has(flag);
        const detailId = `${idPrefix}-${flag}-detail`;
        const { hint, badge } = getRowHints(flag);
        return (
            <FeatureFlagOverrideRow
                key={flag}
                flag={flag}
                serverValue={serverFlags?.[flag]}
                editorValue={editorValue}
                draftText={drafts[flag]}
                rule={appliedRule}
                hint={hint}
                badge={badge}
                isSetInCode={isLocked}
                hasSavedRules={isLocked && hasSavedRules(flag)}
                isInvalid={invalidFlags.has(flag)}
                isExpanded={isExpanded}
                detailId={detailId}
                detail={
                    isExpanded ? (
                        <FeatureFlagJsonDetail
                            id={detailId}
                            flag={flag}
                            serverValue={serverFlags?.[flag]}
                            text={drafts[flag] ?? formatDraftText(editorValue)}
                            isDisabled={isLocked}
                            onTextChange={handleTextChange}
                        />
                    ) : null
                }
                scopes={scopes}
                scopeNames={scopeNames}
                userName={userName}
                isEffectiveTarget={isEffectiveTarget}
                onValueChange={handleValueChange}
                onTextChange={handleTextChange}
                onExpandedChange={handleExpandedChange}
                onTargetChange={handleTargetChange}
                onReset={handleReset}
            />
        );
    };

    const getOtherPageRuleKey = createRuleKeys();
    const otherPageRows = otherPageRules
        .filter((rule) => matchesSearch(rule.flag))
        .map((rule) => (
            <OtherPageRuleRow
                key={getOtherPageRuleKey(rule)}
                rule={rule}
                labels={savedRuleLabels}
                onDelete={(deleted) => setRules((current) => current.filter((item) => item !== deleted))}
            />
        ));
    const staleRows = staleRules.flatMap((staleRule, index) => {
        const flag = getStaleRuleFlag(staleRule.rule);
        if (flag === undefined ? normalizedSearch !== "" : !matchesSearch(flag)) {
            return [];
        }
        return [
            <StaleRuleRow
                // Stale rules have no identity of their own; they only get removed.
                // oxlint-disable-next-line react/no-array-index-key
                key={index}
                staleRule={staleRule}
                labels={savedRuleLabels}
                onDelete={(deleted) => setStaleRules((current) => current.filter((item) => item !== deleted))}
            />,
        ];
    });
    const isOverriddenGroup = (flag: OverridableFeatureFlag) =>
        overriddenOnly || overriddenSnapshot.has(flag);
    const allGroups: IGroup[] = [
        { id: "overridden", rows: visibleFlags.filter(isOverriddenGroup).map(renderFlag) },
        { id: "otherPages", rows: otherPageRows },
        { id: "stale", rows: staleRows },
        { id: "other", rows: visibleFlags.filter((flag) => !isOverriddenGroup(flag)).map(renderFlag) },
    ];
    const groups = allGroups.filter((group) => group.rows.length > 0);
    const showGroupHeadings =
        groups.length > 1 || groups.some((group) => group.id === "otherPages" || group.id === "stale");

    const title = intl.formatMessage({ id: "featureFlagOverrides.title" });

    return (
        <UiModalDialog isOpen onClose={onClose} width={900} accessibilityConfig={{ ariaLabel: title }}>
            <div className={b()}>
                <UiDialogHeader title={title} onClose={onClose} />
                <UiDialogBody>
                    <Message type="warning" className={e("message")}>
                        {intl.formatMessage({ id: "featureFlagOverrides.disclaimer" })}
                    </Message>
                    {errorMessageId ? (
                        <Message type="error" className={e("message")}>
                            {intl.formatMessage({ id: errorMessageId })}
                        </Message>
                    ) : null}
                    {invalidFlags.size > 0 ? (
                        <Message type="error" className={e("message")}>
                            {intl.formatMessage({ id: "featureFlagOverrides.error.invalidValues" })}
                        </Message>
                    ) : null}
                    {isUnreadable ? (
                        <Message type="warning" className={e("message")}>
                            {intl.formatMessage({ id: "featureFlagOverrides.unreadable" })}
                        </Message>
                    ) : null}
                    <div className={e("toolbar")}>
                        <div className={e("search")}>
                            <UiTextInput
                                type="search"
                                size="small"
                                iconBefore="search"
                                value={search}
                                onChange={setSearch}
                                placeholder={intl.formatMessage({ id: "featureFlagOverrides.search" })}
                                accessibilityConfig={{
                                    ariaLabel: intl.formatMessage({ id: "featureFlagOverrides.search" }),
                                }}
                            />
                        </div>
                        <UiButtonSegmentedControl
                            role="group"
                            aria-label={intl.formatMessage({ id: "featureFlagOverrides.view.label" })}
                        >
                            <UiButton
                                size="small"
                                variant="secondary"
                                label={intl.formatMessage({ id: "featureFlagOverrides.view.all" })}
                                badgeAfter={OVERRIDABLE_FLAGS.length}
                                isSelected={!overriddenOnly}
                                accessibilityConfig={{ ariaPressed: !overriddenOnly }}
                                onClick={() => setOverriddenOnly(false)}
                            />
                            <UiButton
                                size="small"
                                variant="secondary"
                                label={intl.formatMessage({ id: "featureFlagOverrides.view.overridden" })}
                                badgeAfter={liveOverriddenFlags.size}
                                isSelected={overriddenOnly}
                                accessibilityConfig={{ ariaPressed: overriddenOnly }}
                                onClick={() => setOverriddenOnly(true)}
                            />
                        </UiButtonSegmentedControl>
                    </div>
                    <div className={e("list")}>
                        <div className={e("columns")} aria-hidden>
                            <span>{intl.formatMessage({ id: "featureFlagOverrides.column.flag" })}</span>
                            <span>{intl.formatMessage({ id: "featureFlagOverrides.column.server" })}</span>
                            <span>{intl.formatMessage({ id: "featureFlagOverrides.column.value" })}</span>
                            <span>{intl.formatMessage({ id: "featureFlagOverrides.column.appliesTo" })}</span>
                        </div>
                        {groups.map((group) => (
                            <section key={group.id}>
                                {showGroupHeadings ? (
                                    <div className={e("group-heading")}>
                                        <UiSectionHeading
                                            label={intl.formatMessage(
                                                { id: GROUP_HEADINGS[group.id] },
                                                { count: group.rows.length },
                                            )}
                                        />
                                    </div>
                                ) : null}
                                <ul className={e("rows")}>{group.rows}</ul>
                            </section>
                        ))}
                        {visibleFlags.length === 0 ? (
                            <EmptyState
                                search={search.trim()}
                                onClearSearch={() => setSearch("")}
                                onShowAll={() => setOverriddenOnly(false)}
                            />
                        ) : null}
                    </div>
                </UiDialogBody>
                <UiDialogFooter divider>
                    <div className={e("footer")}>
                        <div className={e("footer-group")}>
                            <UiButton
                                size="medium"
                                variant="tertiary"
                                iconBefore="upload"
                                label={intl.formatMessage({ id: "featureFlagOverrides.import" })}
                                onClick={() => importInputRef.current?.click()}
                            />
                            <input
                                ref={importInputRef}
                                type="file"
                                accept="application/json,.json"
                                hidden
                                aria-label={intl.formatMessage({ id: "featureFlagOverrides.import" })}
                                onChange={handleImportFile}
                            />
                            <UiButton
                                size="medium"
                                variant="tertiary"
                                iconBefore="download"
                                label={intl.formatMessage({ id: "featureFlagOverrides.export" })}
                                onClick={handleExport}
                            />
                            <span className={e("footer-divider")} />
                            <UiButton
                                size="medium"
                                variant="tertiary"
                                label={intl.formatMessage({ id: "featureFlagOverrides.clearAll" })}
                                onClick={() => replaceDraft({ rules: [], staleRules: [] })}
                            />
                        </div>
                        <div className={e("footer-group")}>
                            {pendingCount > 0 ? (
                                <span className={e("pending")}>
                                    {intl.formatMessage(
                                        { id: "featureFlagOverrides.pending" },
                                        { count: pendingCount },
                                    )}
                                </span>
                            ) : null}
                            <UiButton
                                size="medium"
                                variant="secondary"
                                label={intl.formatMessage({ id: "cancel" })}
                                onClick={onClose}
                            />
                            <UiButton
                                size="medium"
                                variant="primary"
                                label={intl.formatMessage({ id: "featureFlagOverrides.apply" })}
                                isDisabled={invalidFlags.size > 0 || !hasChangesToApply}
                                onClick={handleApply}
                            />
                        </div>
                    </div>
                </UiDialogFooter>
            </div>
        </UiModalDialog>
    );
}

type GroupId = "overridden" | "otherPages" | "stale" | "other";

const GROUP_HEADINGS = {
    overridden: "featureFlagOverrides.group.overridden",
    otherPages: "featureFlagOverrides.otherPages.heading",
    stale: "featureFlagOverrides.stale.title",
    other: "featureFlagOverrides.group.other",
} as const satisfies Record<GroupId, string>;

interface IGroup {
    id: GroupId;
    rows: ReactNode[];
}

/**
 * Hand-edited storage can hold several rules with the same flag and conditions.
 */
function createRuleKeys() {
    const occurrences = new Map<string, number>();
    return ({ flag, organizationId, workspaceId, userId }: FeatureFlagOverrideRule) => {
        const identity = JSON.stringify([flag, organizationId, workspaceId, userId]);
        const occurrence = occurrences.get(identity) ?? 0;
        occurrences.set(identity, occurrence + 1);
        return `${identity}#${occurrence}`;
    };
}

interface IEmptyStateProps {
    search: string;
    onClearSearch: () => void;
    onShowAll: () => void;
}

function EmptyState({ search, onClearSearch, onShowAll }: IEmptyStateProps) {
    const intl = useIntl();
    return (
        <div className={e("empty")}>
            <p>
                {search
                    ? intl.formatMessage({ id: "featureFlagOverrides.empty.search" }, { search })
                    : intl.formatMessage({ id: "featureFlagOverrides.empty.overridden" })}
            </p>
            <UiButton
                size="small"
                variant="link"
                label={intl.formatMessage({
                    id: search
                        ? "featureFlagOverrides.empty.clearSearch"
                        : "featureFlagOverrides.empty.showAll",
                })}
                onClick={search ? onClearSearch : onShowAll}
            />
        </div>
    );
}
