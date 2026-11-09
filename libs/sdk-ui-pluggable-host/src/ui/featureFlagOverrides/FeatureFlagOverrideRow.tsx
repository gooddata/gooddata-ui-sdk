// (C) 2026 GoodData Corporation

import { Fragment, type ReactNode, useId } from "react";

import { useIntl } from "react-intl";

import { type FeatureFlagOverrideRule, type OverridableFeatureFlag } from "@gooddata/sdk-backend-tiger";
import { UiBadge, UiIconButton, UiTag, UiTooltip } from "@gooddata/sdk-ui-kit";

import { e } from "./featureFlagOverridesBem.js";
import { FeatureFlagScopeDropdown, type IScopeNames } from "./FeatureFlagScopeDropdown.js";
import { type IFeatureFlagValueHint, FeatureFlagValueEditor } from "./FeatureFlagValueEditor.js";
import { FeatureFlagValueText } from "./FeatureFlagValueText.js";
import {
    type IOverrideTarget,
    type OverrideScope,
    type OverrideValue,
    getRuleTarget,
    splitCamelCase,
} from "./overrideRules.js";

export interface IFeatureFlagOverrideRowProps {
    flag: OverridableFeatureFlag;
    serverValue: unknown;
    editorValue: unknown;
    draftText: string | undefined;
    rule: FeatureFlagOverrideRule | undefined;
    hint: IFeatureFlagValueHint | undefined;
    badge: string | undefined;
    isSetInCode: boolean;
    hasSavedRules: boolean;
    isInvalid: boolean;
    isExpanded: boolean;
    detailId: string;
    detail: ReactNode;
    scopes: readonly OverrideScope[];
    scopeNames: IScopeNames;
    userName: string;
    isEffectiveTarget: (flag: OverridableFeatureFlag, target: IOverrideTarget) => boolean;
    onValueChange: (flag: OverridableFeatureFlag, value: OverrideValue) => void;
    onTextChange: (flag: OverridableFeatureFlag, text: string) => void;
    onExpandedChange: (flag: OverridableFeatureFlag, isExpanded: boolean) => void;
    onTargetChange: (flag: OverridableFeatureFlag, target: IOverrideTarget) => void;
    onReset: (flag: OverridableFeatureFlag) => void;
}

export function FeatureFlagOverrideRow({
    flag,
    serverValue,
    editorValue,
    draftText,
    rule,
    hint,
    badge,
    isSetInCode,
    hasSavedRules,
    isInvalid,
    isExpanded,
    detailId,
    detail,
    scopes,
    scopeNames,
    userName,
    isEffectiveTarget,
    onValueChange,
    onTextChange,
    onExpandedChange,
    onTargetChange,
    onReset,
}: IFeatureFlagOverrideRowProps) {
    const intl = useIntl();
    const lockedDescriptionId = useId();
    const badgeId = useId();
    const descriptionIds = [
        ...(isSetInCode ? [lockedDescriptionId] : []),
        ...(badge === undefined ? [] : [badgeId]),
    ];
    const isOverridden = rule !== undefined && !isSetInCode;
    const resetKind = getResetKind({ isSetInCode, hasSavedRules, hasRule: rule !== undefined, isInvalid });
    const lockedDescription = intl.formatMessage({ id: "featureFlagOverrides.setInCode.tooltip" });

    return (
        <li
            className={e("row", {
                overridden: isOverridden,
                invalid: isInvalid,
                locked: isSetInCode,
            })}
        >
            <div className={e("name")}>
                <span className={e("name-text")}>
                    {splitCamelCase(flag).map((segment, index) => (
                        // Segments repeat (e.g. "Chart"), and the list never reorders.
                        // oxlint-disable-next-line react/no-array-index-key
                        <Fragment key={index}>
                            {index > 0 ? <wbr /> : null}
                            {segment}
                        </Fragment>
                    ))}
                </span>
                {badge === undefined ? null : (
                    <span id={badgeId} className={e("name-badge")}>
                        <UiBadge label={badge} />
                    </span>
                )}
                {isSetInCode ? (
                    <>
                        <UiTooltip
                            anchor={
                                <UiTag
                                    size="small"
                                    variant="outlined"
                                    iconBefore="lock"
                                    label={intl.formatMessage({ id: "featureFlagOverrides.setInCode" })}
                                />
                            }
                            content={lockedDescription}
                            triggerBy={["hover"]}
                        />
                        <span id={lockedDescriptionId} className="sr-only">
                            {lockedDescription}
                        </span>
                    </>
                ) : null}
            </div>
            <div className={e("server", { empty: serverValue === undefined || serverValue === null })}>
                <span className="sr-only">
                    {intl.formatMessage({ id: "featureFlagOverrides.serverValueCaption" })}{" "}
                </span>
                <FeatureFlagValueText value={serverValue} />
            </div>
            <div className={e("value")}>
                <FeatureFlagValueEditor
                    flag={flag}
                    value={editorValue}
                    draftText={draftText}
                    hint={hint}
                    isDisabled={isSetInCode}
                    isExpanded={isExpanded}
                    detailId={detailId}
                    descriptionIds={descriptionIds}
                    onValueChange={(value) => onValueChange(flag, value)}
                    onTextChange={(text) => onTextChange(flag, text)}
                    onExpandedChange={(expanded) => onExpandedChange(flag, expanded)}
                />
            </div>
            {detail}
            <div className={e("target")}>
                {isSetInCode ? (
                    <span className={e("target-locked")}>
                        {intl.formatMessage({ id: "featureFlagOverrides.fixedInCode" })}
                    </span>
                ) : isOverridden ? (
                    <FeatureFlagScopeDropdown
                        flag={flag}
                        target={getRuleTarget(rule)}
                        scopes={scopes}
                        scopeNames={scopeNames}
                        userName={userName}
                        isEffectiveTarget={(target) => isEffectiveTarget(flag, target)}
                        onTargetChange={(target) => onTargetChange(flag, target)}
                    />
                ) : null}
            </div>
            <div className={e("actions")}>
                {resetKind ? <ResetButton flag={flag} kind={resetKind} onReset={onReset} /> : null}
            </div>
        </li>
    );
}

type ResetKind = "reset" | "discard" | "savedRules";

const RESET_MESSAGES: Record<ResetKind, { label: string; tooltip: string }> = {
    reset: { label: "featureFlagOverrides.reset.label", tooltip: "featureFlagOverrides.reset.tooltip" },
    discard: { label: "featureFlagOverrides.discard.label", tooltip: "featureFlagOverrides.discard.tooltip" },
    savedRules: {
        label: "featureFlagOverrides.reset.savedRules.label",
        tooltip: "featureFlagOverrides.reset.savedRules.tooltip",
    },
};

function getResetKind({
    isSetInCode,
    hasSavedRules,
    hasRule,
    isInvalid,
}: Pick<IFeatureFlagOverrideRowProps, "isSetInCode" | "hasSavedRules" | "isInvalid"> & {
    hasRule: boolean;
}): ResetKind | undefined {
    if (isSetInCode) {
        return hasSavedRules ? "savedRules" : undefined;
    }
    if (hasRule) {
        return "reset";
    }
    return isInvalid ? "discard" : undefined;
}

interface IResetButtonProps {
    flag: OverridableFeatureFlag;
    kind: ResetKind;
    onReset: (flag: OverridableFeatureFlag) => void;
}

function ResetButton({ flag, kind, onReset }: IResetButtonProps) {
    const intl = useIntl();
    const label = intl.formatMessage({ id: RESET_MESSAGES[kind].label }, { flag });
    return (
        <UiTooltip
            triggerBy={["hover", "focus"]}
            arrowPlacement="top"
            accessibilityHidden
            content={intl.formatMessage({ id: RESET_MESSAGES[kind].tooltip })}
            anchor={
                <UiIconButton
                    icon="undo"
                    size="small"
                    variant="tertiary"
                    label={label}
                    accessibilityConfig={{ ariaLabel: label }}
                    onClick={() => onReset(flag)}
                />
            }
        />
    );
}
