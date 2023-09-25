// (C) 2023 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";

import { ISDK, SDK } from "../gooddata.js";
import { DecoratorFactories } from "./types.js";
import { CatalogueModule } from "../catalogue.js";
import { ConfigModule, IConfigStorage } from "../config.js";
import { DashboardModule } from "../dashboard/dashboard.js";
import { ExecutionModule } from "../execution.js";
import { LdmModule } from "../ldm.js";
import { MetadataModule } from "../metadata.js";
import { MetadataModuleExt } from "../metadataExt.js";
import { OrganizationModule } from "../organization.js";
import { ProjectModule } from "../project.js";
import { ReportModule } from "../report/report.js";
import { UserModule } from "../user.js";
import { XhrModule } from "../xhr.js";

export function decoratedSdk(sdk: SDK, decorators: DecoratorFactories): SDK {
    if (isEmpty(decorators)) {
        return sdk;
    }

    return new SDKWithDecoratedModules(sdk, decorators) as unknown as SDK;
}

class SDKWithDecoratedModules implements ISDK {
    public config: ConfigModule;
    public xhr: XhrModule;
    public user: UserModule;
    public md: MetadataModule;
    public mdExt: MetadataModuleExt;
    public execution: ExecutionModule;
    public project: ProjectModule;
    public report: ReportModule;
    public dashboard: DashboardModule;
    public catalogue: CatalogueModule;
    public ldm: LdmModule;
    public configStorage: IConfigStorage;
    public organization: OrganizationModule;
    public utils: {
        loadAttributesMap: any;
        getAttributesDisplayForms: any;
    };

    constructor(private readonly sdk: SDK, decorators: DecoratorFactories) {
        this.configStorage = sdk.configStorage;
        this.config = sdk.config;
        this.xhr = sdk.xhr;
        if (decorators.user) {
            this.user = decorators.user(sdk.user);
        } else {
            this.user = sdk.user;
        }
        this.md = sdk.md;
        this.mdExt = sdk.mdExt;
        this.execution = sdk.execution;
        this.project = sdk.project;
        this.report = sdk.report;
        this.dashboard = sdk.dashboard;
        this.catalogue = sdk.catalogue;
        this.ldm = sdk.ldm;
        this.organization = sdk.organization;
        this.utils = sdk.utils;
    }

    public clone(): SDK {
        return this.sdk.clone();
    }
}
