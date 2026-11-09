// (C) 2026 GoodData Corporation

import { type RefObject, useId } from "react";

import { useIntl } from "react-intl";

import { type OverridableFeatureFlag } from "@gooddata/sdk-backend-tiger";
import {
    type IUiListboxInteractiveItem,
    UiButton,
    UiButtonSegmentedControl,
    UiDropdown,
    UiIconButton,
    UiListbox,
    UiTooltip,
} from "@gooddata/sdk-ui-kit";

import { e } from "./featureFlagOverridesBem.js";
import { FeatureFlagScopeOption, type IScopeOption } from "./FeatureFlagScopeOption.js";
import { type IOverrideTarget, type OverrideScope } from "./overrideRules.js";

const SCOPE_MESSAGES: Record<OverrideScope, string> = {
    everywhere: "featureFlagOverrides.scope.everywhere",
    organization: "featureFlagOverrides.scope.organization",
    workspace: "featureFlagOverrides.scope.workspace",
};

export const SHORT_SCOPE_MESSAGES: Record<OverrideScope, string> = {
    everywhere: "featureFlagOverrides.scope.short.everywhere",
    organization: "featureFlagOverrides.scope.short.organization",
    workspace: "featureFlagOverrides.scope.short.workspace",
};

const joinChunks = (chunks: string[]) => chunks.join("");

export interface IScopeNames {
    organization: string | undefined;
    workspace: string | undefined;
}

export interface IFeatureFlagScopeDropdownProps {
    flag: OverridableFeatureFlag;
    target: IOverrideTarget;
    scopes: readonly OverrideScope[];
    scopeNames: IScopeNames;
    userName: string;
    isEffectiveTarget: (target: IOverrideTarget) => boolean;
    onTargetChange: (target: IOverrideTarget) => void;
}

export function FeatureFlagScopeDropdown({
    flag,
    target,
    scopes,
    scopeNames,
    userName,
    isEffectiveTarget,
    onTargetChange,
}: IFeatureFlagScopeDropdownProps) {
    const intl = useIntl();
    const toggleHintId = useId();
    const signedInAs = intl.formatMessage(
        { id: "featureFlagOverrides.scope.signedInAs" },
        { user: userName },
    );
    const otherOverrideWins = intl.formatMessage({ id: "featureFlagOverrides.scope.otherOverrideWins" });
    const toggledTarget: IOverrideTarget = { ...target, onlyMe: !target.onlyMe };
    const isToggleDisabled = !isEffectiveTarget(toggledTarget);

    const getItems = () =>
        scopes.map((scope): IUiListboxInteractiveItem<IScopeOption> => {
            const isDisabled = scope !== target.scope && !isEffectiveTarget({ ...target, scope });
            const place = intl.formatMessage({ id: SHORT_SCOPE_MESSAGES[scope] });
            const name = scope === "everywhere" ? undefined : scopeNames[scope];
            return {
                type: "interactive",
                id: scope,
                stringTitle:
                    name === undefined
                        ? place
                        : intl.formatMessage(
                              { id: "featureFlagOverrides.scope.option" },
                              { place, name, label: joinChunks, muted: joinChunks },
                          ),
                data: { scope, place, name },
                isDisabled,
                tooltip: isDisabled ? otherOverrideWins : undefined,
            };
        });

    return (
        <div className={e("scope")}>
            <UiButtonSegmentedControl
                role="group"
                aria-label={intl.formatMessage({ id: "featureFlagOverrides.scope.group.label" }, { flag })}
            >
                <UiDropdown
                    autofocusOnOpen
                    closeOnEscape
                    closeOnOutsideClick
                    placement="bottom-end"
                    offset={4}
                    accessibilityConfig={{ triggerRole: "button", popupRole: "listbox" }}
                    renderButton={({ ref, isOpen, ariaAttributes, toggleDropdown }) => (
                        <UiButton
                            // The dropdown only reads the trigger as an HTMLElement; a button is one.
                            ref={ref as RefObject<HTMLButtonElement>}
                            size="small"
                            variant="secondary"
                            iconAfter={isOpen ? "navigateUp" : "navigateDown"}
                            iconAfterSize={14}
                            disableIconAnimation
                            label={intl.formatMessage({ id: SHORT_SCOPE_MESSAGES[target.scope] })}
                            accessibilityConfig={{
                                ariaLabel: intl.formatMessage(
                                    { id: "featureFlagOverrides.scope.button.label" },
                                    { flag, scope: intl.formatMessage({ id: SCOPE_MESSAGES[target.scope] }) },
                                ),
                                ariaHaspopup: "listbox",
                                ariaExpanded: ariaAttributes["aria-expanded"],
                                ariaControls: ariaAttributes["aria-controls"],
                            }}
                            onClick={toggleDropdown}
                        />
                    )}
                    renderBody={({ closeDropdown, ariaAttributes }) => (
                        <UiListbox
                            items={getItems()}
                            selectedItemId={target.scope}
                            maxWidth={260}
                            isDisabledFocusable
                            isCompact
                            InteractiveItemComponent={FeatureFlagScopeOption}
                            shouldKeyboardActionStopPropagation
                            shouldKeyboardActionPreventDefault
                            onSelect={(item) => onTargetChange({ ...target, scope: item.data.scope })}
                            onClose={closeDropdown}
                            onUnhandledKeyDown={(event) => {
                                if (event.key === "Tab") {
                                    closeDropdown();
                                }
                            }}
                            ariaAttributes={{
                                id: ariaAttributes.id,
                                "aria-label": intl.formatMessage(
                                    { id: "featureFlagOverrides.scope.label" },
                                    { flag },
                                ),
                            }}
                        />
                    )}
                />
                <UiTooltip
                    triggerBy={["hover", "focus"]}
                    arrowPlacement="top"
                    accessibilityHidden
                    content={isToggleDisabled ? otherOverrideWins : signedInAs}
                    anchor={
                        <UiIconButton
                            icon="user"
                            size="small"
                            variant="secondary"
                            isActive={target.onlyMe}
                            isDisabled={isToggleDisabled}
                            label={signedInAs}
                            accessibilityConfig={{
                                ariaPressed: target.onlyMe,
                                ariaDescribedBy: isToggleDisabled ? toggleHintId : undefined,
                            }}
                            onClick={() => onTargetChange(toggledTarget)}
                        />
                    }
                />
            </UiButtonSegmentedControl>
            {isToggleDisabled ? (
                <span id={toggleHintId} className="sr-only">
                    {otherOverrideWins}
                </span>
            ) : null}
        </div>
    );
}
