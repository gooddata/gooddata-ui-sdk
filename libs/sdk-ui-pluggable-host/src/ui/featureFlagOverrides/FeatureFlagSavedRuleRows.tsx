// (C) 2026 GoodData Corporation

import { Fragment } from "react";

import { useIntl } from "react-intl";

import {
    type FeatureFlagOverrideRule,
    type IFeatureFlagOverrideContext,
    type IStaleFeatureFlagOverrideRule,
    type StaleFeatureFlagOverrideReason,
} from "@gooddata/sdk-backend-tiger";
import { UiIcon, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { e } from "./featureFlagOverridesBem.js";
import { SHORT_SCOPE_MESSAGES } from "./FeatureFlagScopeDropdown.js";
import { formatFlagValue } from "./FeatureFlagValueText.js";
import { type OverrideScope, getRuleTarget } from "./overrideRules.js";
import { useWorkspaceTitles } from "./useWorkspaceTitle.js";

const CONDITION_SEPARATOR = " · ";

// The tooltip anchor wrapper sizes to its content; capping it lets the line clip.
const CONDITIONS_ANCHOR_STYLE = { display: "block", minWidth: 0, maxWidth: "100%" } as const;

const STALE_REASON_MESSAGES: Record<StaleFeatureFlagOverrideReason, string> = {
    invalidRule: "featureFlagOverrides.stale.invalidRule",
    unknownFlag: "featureFlagOverrides.stale.unknownFlag",
    gateFlag: "featureFlagOverrides.stale.gateFlag",
    invalidValue: "featureFlagOverrides.stale.invalidValue",
};

type RuleConditionKind = "organization" | "workspace" | "user";

const RULE_CONDITION_MESSAGES = {
    organization: {
        idOnly: "featureFlagOverrides.otherPages.organization.id",
        named: "featureFlagOverrides.otherPages.organization.named",
        namedWithId: "featureFlagOverrides.otherPages.organization.namedWithId",
    },
    workspace: {
        idOnly: "featureFlagOverrides.otherPages.workspace.id",
        named: "featureFlagOverrides.otherPages.workspace.named",
        namedWithId: "featureFlagOverrides.otherPages.workspace.namedWithId",
    },
    user: {
        idOnly: "featureFlagOverrides.otherPages.user.id",
        named: "featureFlagOverrides.otherPages.user.named",
        namedWithId: "featureFlagOverrides.otherPages.user.namedWithId",
    },
} as const satisfies Record<RuleConditionKind, { idOnly: string; named: string; namedWithId: string }>;

export interface IRuleDetail {
    text: string;
    tooltip: string;
    hiddenId?: string;
}

export interface ISavedRuleLabelsOptions {
    rules: readonly FeatureFlagOverrideRule[];
    context: IFeatureFlagOverrideContext;
    organizationTitle: string | undefined;
    workspaceTitle: string | undefined;
    userName: string;
}

export interface ISavedRuleLabels {
    getConditions: (rule: FeatureFlagOverrideRule) => IRuleDetail[];
    getUserLabel: (userId: string) => string;
}

export function useSavedRuleLabels({
    rules,
    context,
    organizationTitle,
    workspaceTitle,
    userName,
}: ISavedRuleLabelsOptions): ISavedRuleLabels {
    const intl = useIntl();
    const isInCurrentOrganization = (rule: FeatureFlagOverrideRule) =>
        rule.organizationId === undefined || rule.organizationId === context.organizationId;
    // Workspace IDs are unique only within an organization, and the backend reads the current one.
    const getLookupWorkspaceId = (rule: FeatureFlagOverrideRule) =>
        isInCurrentOrganization(rule) ? rule.workspaceId : undefined;
    const workspaceTitles = useWorkspaceTitles(
        rules.flatMap((rule) => {
            const workspaceId = getLookupWorkspaceId(rule);
            return workspaceId === undefined || workspaceId === context.workspaceId ? [] : [workspaceId];
        }),
    );
    const getWorkspaceName = (rule: FeatureFlagOverrideRule) => {
        const workspaceId = getLookupWorkspaceId(rule);
        if (workspaceId === undefined) {
            return undefined;
        }
        return workspaceId === context.workspaceId ? workspaceTitle : workspaceTitles.get(workspaceId);
    };
    const getUserName = (userId: string) => (userId === context.userId ? userName : undefined);
    const format = (kind: RuleConditionKind, id: string, name: string | undefined): IRuleDetail => {
        const messages = RULE_CONDITION_MESSAGES[kind];
        if (!name) {
            const text = intl.formatMessage({ id: messages.idOnly }, { id });
            return { text, tooltip: text };
        }
        return {
            text: intl.formatMessage({ id: messages.named }, { name }),
            tooltip: intl.formatMessage({ id: messages.namedWithId }, { name, id }),
            hiddenId: intl.formatMessage({ id: "featureFlagOverrides.otherPages.id" }, { id }),
        };
    };

    const getConditions = (rule: FeatureFlagOverrideRule) => {
        const conditions: IRuleDetail[] = [];
        const isCurrentOrganization = rule.organizationId === context.organizationId;
        if (rule.organizationId !== undefined && !(isCurrentOrganization && rule.workspaceId !== undefined)) {
            conditions.push(
                format(
                    "organization",
                    rule.organizationId,
                    isCurrentOrganization ? organizationTitle : undefined,
                ),
            );
        }
        if (rule.workspaceId !== undefined) {
            conditions.push(format("workspace", rule.workspaceId, getWorkspaceName(rule)));
        }
        if (rule.userId !== undefined) {
            conditions.push(format("user", rule.userId, getUserName(rule.userId)));
        }
        return conditions;
    };
    return { getConditions, getUserLabel: (userId) => getUserName(userId) || userId };
}

export interface IOtherPageRuleRowProps {
    rule: FeatureFlagOverrideRule;
    labels: ISavedRuleLabels;
    onDelete: (rule: FeatureFlagOverrideRule) => void;
}

export function OtherPageRuleRow({ rule, labels, onDelete }: IOtherPageRuleRowProps) {
    const intl = useIntl();
    const conditions = labels.getConditions(rule);
    return (
        <SavedRuleRow
            name={rule.flag}
            details={conditions}
            value={formatFlagValue(intl, rule.value)}
            scope={getRuleTarget(rule).scope}
            user={rule.userId === undefined ? undefined : labels.getUserLabel(rule.userId)}
            deleteLabel={intl.formatMessage(
                { id: "featureFlagOverrides.otherPages.delete.label" },
                { flag: rule.flag, conditions: joinTexts(conditions.map(({ text }) => text)) },
            )}
            onDelete={() => onDelete(rule)}
        />
    );
}

export interface IStaleRuleRowProps {
    staleRule: IStaleFeatureFlagOverrideRule;
    labels: ISavedRuleLabels;
    onDelete: (staleRule: IStaleFeatureFlagOverrideRule) => void;
}

export function StaleRuleRow({ staleRule, labels, onDelete }: IStaleRuleRowProps) {
    const intl = useIntl();
    const { rule, reason } = staleRule;
    const flag = getStaleRuleFlag(rule);
    const conditions = readStaleRuleConditions(rule);
    return (
        <SavedRuleRow
            name={flag ?? intl.formatMessage({ id: "featureFlagOverrides.stale.unnamed" })}
            details={[toDetail(intl.formatMessage({ id: STALE_REASON_MESSAGES[reason] }))]}
            value={formatFlagValue(intl, readProperty(rule, "value"))}
            scope={conditions ? getRuleTarget(conditions).scope : undefined}
            user={conditions?.userId === undefined ? undefined : labels.getUserLabel(conditions.userId)}
            deleteLabel={
                flag === undefined
                    ? intl.formatMessage({ id: "featureFlagOverrides.stale.delete.labelNoFlag" })
                    : intl.formatMessage({ id: "featureFlagOverrides.stale.delete.label" }, { flag })
            }
            onDelete={() => onDelete(staleRule)}
        />
    );
}

export function getStaleRuleFlag(rule: unknown): string | undefined {
    const flag = readProperty(rule, "flag");
    return typeof flag === "string" ? flag : undefined;
}

function readProperty(value: unknown, key: string): unknown {
    return typeof value === "object" && value !== null
        ? Object.getOwnPropertyDescriptor(value, key)?.value
        : undefined;
}

/**
 * Undefined when a condition holds something other than a string.
 */
function readStaleRuleConditions(rule: unknown): IFeatureFlagOverrideContext | undefined {
    if (typeof rule !== "object" || rule === null) {
        return undefined;
    }
    const conditions: IFeatureFlagOverrideContext = {};
    for (const key of ["organizationId", "workspaceId", "userId"] as const) {
        const value = readProperty(rule, key);
        if (typeof value === "string") {
            conditions[key] = value;
        } else if (value !== undefined) {
            return undefined;
        }
    }
    return conditions;
}

const joinTexts = (texts: string[]) => texts.join(CONDITION_SEPARATOR);

const toDetail = (text: string): IRuleDetail => ({ text, tooltip: text });

interface ISavedRuleRowProps {
    name: string;
    details: IRuleDetail[];
    value: string;
    scope: OverrideScope | undefined;
    user: string | undefined;
    deleteLabel: string;
    onDelete: () => void;
}

function SavedRuleRow({ name, details, value, scope, user, deleteLabel, onDelete }: ISavedRuleRowProps) {
    const intl = useIntl();
    return (
        <li className={e("row", { other: true })}>
            <div className={e("name")}>
                <div className={e("name-lines")}>
                    <span className={e("name-text")}>{name}</span>
                    <UiTooltip
                        anchor={
                            <div className={e("conditions")}>
                                {details.map(({ text, hiddenId }, index) => (
                                    <Fragment key={text}>
                                        {index > 0 ? CONDITION_SEPARATOR : null}
                                        <span className={e("condition")}>
                                            {text}
                                            {hiddenId ? (
                                                <>
                                                    {" "}
                                                    <span className="sr-only">{hiddenId}</span>
                                                </>
                                            ) : null}
                                        </span>
                                    </Fragment>
                                ))}
                            </div>
                        }
                        content={joinTexts(details.map(({ tooltip }) => tooltip))}
                        triggerBy={["hover"]}
                        accessibilityHidden
                        arrowPlacement="top-start"
                        optimalPlacement
                        anchorWrapperStyles={CONDITIONS_ANCHOR_STYLE}
                    />
                </div>
            </div>
            <div className={e("server", { empty: true })}>
                <span className="sr-only">
                    {intl.formatMessage({ id: "featureFlagOverrides.serverValueCaption" })}{" "}
                </span>
                {formatFlagValue(intl, undefined)}
            </div>
            <div className={e("value-text")}>{value}</div>
            <div className={e("scope-text")}>
                {scope ? intl.formatMessage({ id: SHORT_SCOPE_MESSAGES[scope] }) : null}
                {user === undefined ? null : (
                    <UiTooltip
                        triggerBy={["hover"]}
                        arrowPlacement="top"
                        accessibilityHidden
                        content={intl.formatMessage(
                            { id: "featureFlagOverrides.scope.signedInAs" },
                            { user },
                        )}
                        anchor={
                            <UiIcon
                                type="user"
                                size={14}
                                color="complementary-6"
                                accessibilityConfig={{ ariaHidden: true }}
                            />
                        }
                    />
                )}
            </div>
            <div className={e("actions")}>
                <DeleteRuleButton label={deleteLabel} onDelete={onDelete} />
            </div>
        </li>
    );
}

interface IDeleteRuleButtonProps {
    label: string;
    onDelete: () => void;
}

function DeleteRuleButton({ label, onDelete }: IDeleteRuleButtonProps) {
    const intl = useIntl();
    return (
        <UiTooltip
            triggerBy={["hover", "focus"]}
            arrowPlacement="top"
            accessibilityHidden
            content={intl.formatMessage({ id: "featureFlagOverrides.stale.delete.tooltip" })}
            anchor={
                <UiIconButton
                    icon="trash"
                    size="small"
                    variant="tertiary"
                    isDesctructive
                    label={label}
                    onClick={onDelete}
                />
            }
        />
    );
}
