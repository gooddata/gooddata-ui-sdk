// (C) 2019-2022 GoodData Corporation
import {
    IAnalyticalBackend,
    IDashboardPlugin,
    IDashboardWithReferences,
    IGetDashboardOptions,
    ISecuritySettingsService,
    IWorkspaceDashboardsService,
    SupportedDashboardReferenceTypes,
} from "@gooddata/sdk-backend-spi";
import {
    decoratedBackend,
    DecoratedSecuritySettingsService,
    DecoratedWorkspaceDashboardsService,
} from "@gooddata/sdk-backend-base";
import { areObjRefsEqual, ObjRef, objRefToString } from "@gooddata/sdk-model";
import { LocalDashboardPluginsConfig } from "../../types";

class WithLocalDashboardPlugins extends DecoratedWorkspaceDashboardsService {
    constructor(
        protected decorated: IWorkspaceDashboardsService,
        public workspace: string,
        private localDashboardPluginsConfig: LocalDashboardPluginsConfig,
    ) {
        super(decorated, workspace);
    }

    public async getDashboardWithReferences(
        ref: ObjRef,
        filterContextRef?: ObjRef,
        options?: IGetDashboardOptions,
        types?: SupportedDashboardReferenceTypes[],
    ): Promise<IDashboardWithReferences> {
        const dashboardWithReferences = await this.decorated.getDashboardWithReferences(
            ref,
            filterContextRef,
            options,
            types,
        );
        const localPluginLinks =
            this.localDashboardPluginsConfig.links[dashboardWithReferences.dashboard.identifier];
        const referencedLocalPlugins = localPluginLinks.reduce((acc: IDashboardPlugin[], pluginLink) => {
            const plugin = this.localDashboardPluginsConfig?.plugins.find((p) =>
                areObjRefsEqual(p.ref, pluginLink.plugin),
            );
            if (!plugin) {
                // eslint-disable-next-line no-console
                console.error(
                    `Referenced dashboard plugin ${objRefToString(
                        pluginLink.plugin,
                    )} not found! Check recorded backend dashboardPlugins config and ensure that the plugin is included.`,
                );
            } else {
                acc.push(plugin);
            }

            return acc;
        }, []);

        return {
            dashboard: {
                ...dashboardWithReferences.dashboard,
                plugins: [...(dashboardWithReferences.dashboard.plugins ?? []), ...localPluginLinks],
            },
            references: {
                ...dashboardWithReferences.references,
                plugins: [...dashboardWithReferences.references.plugins, ...referencedLocalPlugins],
            },
        };
    }
}

class WithLocalDashboardPluginsSecuritySettings extends DecoratedSecuritySettingsService {
    constructor(decorated: ISecuritySettingsService) {
        super(decorated);
    }

    public isUrlValid = (): Promise<boolean> => {
        return Promise.resolve(true);
    };

    public isDashboardPluginUrlValid = (): Promise<boolean> => {
        return Promise.resolve(true);
    };
}

export function withLocalDashboardPlugins(
    backend: IAnalyticalBackend,
    localPluginsConfig: LocalDashboardPluginsConfig,
): IAnalyticalBackend {
    return decoratedBackend(backend, {
        dashboards: (original, workspace) =>
            new WithLocalDashboardPlugins(original, workspace, localPluginsConfig),
        securitySettings: (original) => new WithLocalDashboardPluginsSecuritySettings(original),
    });
}
