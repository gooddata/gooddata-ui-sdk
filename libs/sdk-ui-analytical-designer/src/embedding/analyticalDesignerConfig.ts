// (C) 2026 GoodData Corporation

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type IInsight,
    type ITheme,
    type ObjRef,
    insightId,
    isIdentifierRef,
    isUriRef,
    objRefToString,
} from "@gooddata/sdk-model";

import { type IBootstrapData } from "../actions/app_context_actions.js";

import { type IAnalyticalDesignerConfig, type IAnalyticalDesignerProps } from "./analyticalDesignerTypes.js";
import { type IAdEmbeddedRouteConfig } from "./buildEmbeddedHash.js";

/** The identifiers AD builds its route from, resolved from the identifiers and refs of the props. */
export interface IResolvedRouteIdentifiers {
    insightId?: string;
    sourceDashboardId?: string;
    sourceInsightId?: string;
}

/** A stable key of an insight, ref or identifier, for comparing the props between renders. */
export function routeTargetKey(target: string | ObjRef | IInsight | undefined): string {
    if (target === undefined) {
        return "";
    }
    if (typeof target === "string") {
        return `id:${target}`;
    }
    if (isIdentifierRef(target) || isUriRef(target)) {
        return objRefToString(target);
    }
    return `id:${insightId(target)}`;
}

/** The identifier of an insight; a URI ref is loaded from the backend. */
export async function resolveInsightIdentifier(
    backend: IAnalyticalBackend,
    workspace: string,
    target: string | ObjRef | IInsight | undefined,
): Promise<string | undefined> {
    if (target === undefined) {
        return undefined;
    }
    if (typeof target === "string") {
        return target;
    }
    if (isIdentifierRef(target)) {
        return target.identifier;
    }
    if (isUriRef(target)) {
        const insight = await backend.workspace(workspace).insights().getInsight(target);
        return insightId(insight);
    }
    return insightId(target);
}

/** The identifier of a dashboard; a URI ref is loaded from the backend. An empty string stays empty. */
export async function resolveDashboardIdentifier(
    backend: IAnalyticalBackend,
    workspace: string,
    target: string | ObjRef | undefined,
): Promise<string | undefined> {
    if (target === undefined) {
        return undefined;
    }
    if (typeof target === "string") {
        return target;
    }
    if (isIdentifierRef(target)) {
        return target.identifier;
    }
    const dashboard = await backend.workspace(workspace).dashboards().getDashboard(target);
    return dashboard.identifier;
}

/** Resolves the identifiers AD builds its route from. */
export async function resolveRouteIdentifiers(
    backend: IAnalyticalBackend,
    workspace: string,
    insight: IAnalyticalDesignerProps["insight"],
    config: IAnalyticalDesignerConfig,
): Promise<IResolvedRouteIdentifiers> {
    const [resolvedInsightId, sourceDashboardId, sourceInsightId] = await Promise.all([
        resolveInsightIdentifier(backend, workspace, insight),
        resolveDashboardIdentifier(backend, workspace, config.sourceDashboard),
        resolveInsightIdentifier(backend, workspace, config.sourceInsight),
    ]);
    return { insightId: resolvedInsightId, sourceDashboardId, sourceInsightId };
}

/** The route AD navigates to: the resolved identifiers and the route values of the config. */
export function toRouteConfig(
    identifiers: IResolvedRouteIdentifiers,
    config: IAnalyticalDesignerConfig,
): IAdEmbeddedRouteConfig {
    return {
        insightId: identifiers.insightId,
        sourceDashboardId: identifiers.sourceDashboardId,
        sourceInsightId: identifiers.sourceInsightId,
        hideActions: config.hiddenActions,
        displayActions: config.displayedActions,
        allowDashboardLinks: config.allowDashboardLinks,
        isEmbeddedFromKD: config.isEmbedded,
        thousandSeparator: config.separators?.thousand,
        decimalSeparator: config.separators?.decimal,
        asOfDate: config.asOfDate,
        includeObjectsWithTags: config.includeObjectsWithTags,
        excludeObjectsWithTags: config.excludeObjectsWithTags,
    };
}

/**
 * The theme AD applies: the theme of the props, else the loaded one, changed by the modifier. With
 * theme loading disabled and no theme in the props, an empty theme stops AD from loading one itself.
 */
export function resolveTheme(
    { theme, disableThemeLoading, themeModifier }: IAnalyticalDesignerProps,
    loadedTheme: ITheme | undefined,
): ITheme | undefined {
    const base = theme ?? (disableThemeLoading ? {} : loadedTheme);
    return base && themeModifier ? themeModifier(base) : base;
}

/** AD's bootstrap data loaded from the backend, with the values the config provides applied on top. */
export function applyConfigToBootstrapData(
    data: IBootstrapData,
    config: IAnalyticalDesignerConfig,
    theme: ITheme | undefined,
): IBootstrapData {
    const { whiteLabeling, organization } = config;
    return {
        ...data,
        mapboxToken: config.mapboxToken ?? data.mapboxToken,
        agGridToken: config.agGridToken ?? data.agGridToken,
        colorPalette: config.colorPalette ?? data.colorPalette,
        theme,
        user: {
            ...data.user,
            formatLocale: config.formatLocale ?? data.user.formatLocale,
        },
        uiSettings: {
            ...data.uiSettings,
            logoUrl: whiteLabeling?.logoUrl ?? data.uiSettings.logoUrl,
            isBranded: whiteLabeling?.isBranded ?? data.uiSettings.isBranded,
        },
        tiger: {
            ...data.tiger,
            isOrganizationAdmin: organization?.isAdmin ?? data.tiger.isOrganizationAdmin,
            organizationExpiredDate: organization?.expiredDate ?? data.tiger.organizationExpiredDate,
            organizationEntitlements: organization?.entitlements ?? data.tiger.organizationEntitlements,
        },
    };
}
