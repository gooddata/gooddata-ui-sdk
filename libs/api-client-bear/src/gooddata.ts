// (C) 2007-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import { getAttributesDisplayForms } from "@gooddata/api-model-bear";
import { XhrModule } from "./xhr.js";
import { UserModule } from "./user.js";
import { MetadataModule } from "./metadata.js";
import { MetadataModuleExt } from "./metadataExt.js";
import { ExecutionModule } from "./execution.js";
import { ProjectModule } from "./project.js";
import { ReportModule } from "./report/report.js";
import { DashboardModule } from "./dashboard/dashboard.js";
import { sanitizeConfig, IConfigStorage, ConfigModule } from "./config.js";
import { CatalogueModule } from "./catalogue.js";
import { AttributesMapLoaderModule } from "./utils/attributesMapLoader.js";
import { LdmModule } from "./ldm.js";
import { OrganizationModule } from "./organization.js";

/**
 * This package provides low-level functions for communication with the GoodData platform.
 *
 * @remarks
 * The package is used by `@gooddata/sdk-backend-bear`, which you should use instead of directly using `@gooddata/api-client-bear` whenever possible.
 *
 * For the similar package for GoodData Cloud and GoodData.CN, see `@gooddata/api-client-tiger`.
 *
 * @packageDocumentation
 */

/**
 * # JS SDK
 * Here is a set of functions that mostly are a thin wrapper over the [GoodData API](https://developer.gooddata.com/api).
 * Before calling any of those functions, you need to authenticate with a valid GoodData
 * user credentials. After that, every subsequent call in the current session is authenticated.
 * You can find more about the GD authentication mechanism here.
 *
 * ## GD Authentication Mechanism
 * In this JS SDK library we provide you with a simple `login(username, passwd)` function
 * that does the magic for you.
 * To fully understand the authentication mechanism, please read
 * [Authentication via API article](http://developer.gooddata.com/article/authentication-via-api)
 * on [GoodData Developer Portal](http://developer.gooddata.com/)
 *
 */
export class SDK {
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

    constructor(private fetchMethod: typeof fetch, config = {}) {
        this.configStorage = sanitizeConfig(config); // must be plain object, SDK modules MUST use this storage

        this.config = new ConfigModule(this.configStorage);
        this.xhr = new XhrModule(fetchMethod, this.configStorage);
        this.user = new UserModule(this.xhr);
        this.md = new MetadataModule(this.xhr);
        this.mdExt = new MetadataModuleExt(this.xhr);
        this.execution = new ExecutionModule(this.xhr, this.md);
        this.project = new ProjectModule(this.xhr);
        this.report = new ReportModule(this.xhr);
        this.dashboard = new DashboardModule(this.xhr);
        this.catalogue = new CatalogueModule(this.xhr, this.execution);
        this.ldm = new LdmModule(this.xhr);
        this.organization = new OrganizationModule(this.xhr);

        const attributesMapLoaderModule = new AttributesMapLoaderModule(this.md);
        this.utils = {
            loadAttributesMap: attributesMapLoaderModule.loadAttributesMap.bind(attributesMapLoaderModule),
            getAttributesDisplayForms,
        };
    }

    public clone(): SDK {
        return new SDK(this.fetchMethod, cloneDeep(this.configStorage));
    }
}

/**
 * # Factory for creating SDK instances
 *
 * @param config - object to be passed to SDK constructor
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const factory =
    (fetchMethod: typeof fetch) =>
    (config: any = {}): SDK =>
        new SDK(fetchMethod, config);
