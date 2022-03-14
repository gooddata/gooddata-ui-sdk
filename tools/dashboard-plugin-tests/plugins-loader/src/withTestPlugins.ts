// (C) 2019-2022 GoodData Corporation
import {
    IAnalyticalBackend,
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
import { ObjRef } from "@gooddata/sdk-model";

import { IDashboardPluginTestConfig } from "./setup";

class WithTestPlugins extends DecoratedWorkspaceDashboardsService {
    constructor(
        protected decorated: IWorkspaceDashboardsService,
        public workspace: string,
        private localDashboardPluginsConfig: IDashboardPluginTestConfig,
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
        const localPluginLinks = this.localDashboardPluginsConfig.links;
        const referencedLocalPlugins = this.localDashboardPluginsConfig.plugins;

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

class WithTestPluginsSecuritySettings extends DecoratedSecuritySettingsService {
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

/**
 * @internal
 */
export function withTestPlugins(config: IDashboardPluginTestConfig) {
    return function decorate(backend: IAnalyticalBackend): IAnalyticalBackend {
        return decoratedBackend(backend, {
            dashboards: (original, workspace) => new WithTestPlugins(original, workspace, config),
            securitySettings: (original) => new WithTestPluginsSecuritySettings(original),
        });
    };
}
