// (C) 2026 GoodData Corporation

import { useMemo, useState } from "react";

import { useIntl } from "react-intl";

import {
    type IFeatureFlagOverrideContext,
    type IStoredFeatureFlagOverrides,
    readFeatureFlagOverrides,
} from "@gooddata/sdk-backend-tiger";
import { type ISettings } from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";
import { UiIcon } from "@gooddata/sdk-ui-kit";

import { e } from "./featureFlagOverridesBem.js";
import { FeatureFlagOverridesPanel } from "./FeatureFlagOverridesPanel.js";
import { getOverriddenFlags, getOverrideUserName } from "./overrideRules.js";
import "./FeatureFlagOverrides.scss";

export interface IFeatureFlagOverridesState {
    stored: IStoredFeatureFlagOverrides;
    context: IFeatureFlagOverrideContext;
    count: number;
    organizationTitle: string | undefined;
    userName: string;
}

/**
 * Returns undefined when the tool is off: the gate flag is not on, or the page is an export.
 */
export function useFeatureFlagOverrides(ctx: IPlatformContext): IFeatureFlagOverridesState | undefined {
    const [stored] = useState(readFeatureFlagOverrides);
    const isEnabled = ctx.settings.enableFeatureFlagOverrides === true && !ctx.isExportMode;
    const organizationId = ctx.organization?.id;
    const workspaceId = ctx.currentWorkspaceId;
    const userId = ctx.userSettings.userId;
    const organizationTitle = ctx.organization?.title;
    const userName = getOverrideUserName(ctx.user);

    return useMemo(() => {
        if (!isEnabled) {
            return undefined;
        }
        const context: IFeatureFlagOverrideContext = { organizationId, workspaceId, userId };
        const count = getOverriddenFlags(stored.rules, context).size;
        return { stored, context, count, organizationTitle, userName };
    }, [isEnabled, stored, organizationId, workspaceId, userId, organizationTitle, userName]);
}

export interface IFeatureFlagOverridesProps {
    overrides: IFeatureFlagOverridesState;
    settings: ISettings;
    isOpen: boolean;
    initialOverriddenOnly: boolean;
    onBadgeClick: () => void;
    onClose: () => void;
}

export function FeatureFlagOverrides({
    overrides,
    settings,
    isOpen,
    initialOverriddenOnly,
    onBadgeClick,
    onClose,
}: IFeatureFlagOverridesProps) {
    const intl = useIntl();
    const { stored, context, count, organizationTitle, userName } = overrides;

    return (
        <>
            {count > 0 ? (
                <button type="button" className={e("badge")} aria-haspopup="dialog" onClick={onBadgeClick}>
                    <UiIcon
                        type="settings"
                        size={14}
                        color="currentColor"
                        accessibilityConfig={{ ariaHidden: true }}
                    />
                    <span>{intl.formatMessage({ id: "featureFlagOverrides.badge" }, { count })}</span>
                </button>
            ) : null}
            {isOpen ? (
                <FeatureFlagOverridesPanel
                    stored={stored}
                    context={context}
                    organizationTitle={organizationTitle}
                    userName={userName}
                    settings={settings}
                    initialOverriddenOnly={initialOverriddenOnly}
                    onClose={onClose}
                    onApplied={() => window.location.reload()}
                />
            ) : null}
        </>
    );
}
