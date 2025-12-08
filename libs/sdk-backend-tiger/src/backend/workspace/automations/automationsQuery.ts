// (C) 2024-2025 GoodData Corporation

import { EntitiesApiGetAllEntitiesAutomationsRequest, MetadataUtilities } from "@gooddata/api-client-tiger";
import { EntitiesApi_GetAllEntitiesAutomations } from "@gooddata/api-client-tiger/entitiesObjects";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    AutomationFilterType,
    AutomationType,
    IAutomationsQuery,
    IAutomationsQueryResult,
    IGetAutomationsQueryOptions,
} from "@gooddata/sdk-backend-spi";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";

import { buildFieldFilter, buildStatusFilter } from "./filterBuilders.js";
import { convertAutomationListToAutomations } from "../../../convertors/fromBackend/AutomationConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { getSettingsForCurrentUser } from "../settings/index.js";

export class AutomationsQuery implements IAutomationsQuery {
    private size = 100;
    private page = 0;
    private author: string | null = null;
    private authorFilterType: AutomationFilterType = "exact";
    private recipient: string | null = null;
    private recipientFilterType: AutomationFilterType = "exact";
    private externalRecipient: string | null = null;
    private user: string | null = null;
    private dashboard: string | null = null;
    private dashboardFilterType: AutomationFilterType = "exact";
    private status: string | null = null;
    private statusFilterType: AutomationFilterType = "exact";
    private filter: { title?: string } = {};
    private sort = {};
    private type: AutomationType | undefined = undefined;
    private totalCount: number | undefined = undefined;

    constructor(
        public readonly authCall: TigerAuthenticatedCallGuard,
        private requestParameters: EntitiesApiGetAllEntitiesAutomationsRequest,
        private options?: IGetAutomationsQueryOptions,
    ) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withSize(size: number): IAutomationsQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): IAutomationsQuery {
        this.page = page;
        return this;
    }

    withFilter(filter: { title?: string }): IAutomationsQuery {
        this.filter = { ...filter };
        // We need to reset total count whenever filter changes
        this.setTotalCount(undefined);
        return this;
    }

    withSorting(sort: string[]): IAutomationsQuery {
        this.sort = { sort };
        return this;
    }

    withType(type: AutomationType): IAutomationsQuery {
        this.type = type;
        return this;
    }

    withAuthor(author: string, filterType: AutomationFilterType = "exact"): IAutomationsQuery {
        this.author = author;
        this.authorFilterType = filterType;
        return this;
    }

    withRecipient(recipient: string, filterType: AutomationFilterType = "exact"): IAutomationsQuery {
        this.recipient = recipient;
        this.recipientFilterType = filterType;
        return this;
    }

    withExternalRecipient(externalRecipient: string): IAutomationsQuery {
        this.externalRecipient = externalRecipient;
        return this;
    }

    withUser(user: string): IAutomationsQuery {
        this.user = user;
        return this;
    }

    withDashboard(dashboard: string, filterType: AutomationFilterType = "exact"): IAutomationsQuery {
        this.dashboard = dashboard;
        this.dashboardFilterType = filterType;
        return this;
    }

    withStatus(status: string, filterType: AutomationFilterType = "exact"): IAutomationsQuery {
        this.status = status;
        this.statusFilterType = filterType;
        return this;
    }

    query(): Promise<IAutomationsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                /**
                 * For backend performance reasons, we do not want to ask for paging info each time.
                 */
                const metaIncludeObj =
                    this.totalCount === undefined ? { metaInclude: ["page" as const] } : {};

                const includeAutomationResult = this.options?.includeAutomationResult
                    ? ["automationResults" as const]
                    : [];

                const filterObj = this.constructFilter();

                const userSettings = await getSettingsForCurrentUser(
                    this.authCall,
                    this.requestParameters.workspaceId,
                );
                const enableAutomationFilterContext = userSettings.enableAutomationFilterContext ?? true;
                const enableNewScheduledExport = userSettings.enableNewScheduledExport ?? false;

                const items = await this.authCall((client) =>
                    EntitiesApi_GetAllEntitiesAutomations(client.axios, client.basePath, {
                        ...this.requestParameters,
                        ...metaIncludeObj,
                        ...filterObj,
                        ...this.sort,
                        include: [
                            "createdBy",
                            "modifiedBy",
                            "notificationChannel",
                            "recipients",
                            "exportDefinitions",
                            "analyticalDashboard",
                            ...includeAutomationResult,
                        ],
                        origin: "NATIVE", // ensures that no inherited automations are returned
                        size: limit,
                        page: offset / limit,
                    }),
                )
                    .then((res) => MetadataUtilities.filterValidEntities(res.data))
                    .then((data) => {
                        const totalCount = data.meta?.page?.totalElements;
                        if (!(totalCount === null || totalCount === undefined)) {
                            this.setTotalCount(totalCount);
                        }
                        return convertAutomationListToAutomations(
                            data,
                            enableAutomationFilterContext,
                            enableNewScheduledExport,
                        );
                    });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }

    async queryAll(): Promise<IAutomationMetadataObject[]> {
        const firstQuery = await this.query();
        return firstQuery.all();
    }

    private constructFilter = () => {
        const allFilters: string[] = [];

        if (this.filter.title) {
            allFilters.push(`title=containsic='${this.filter.title}'`); // contains + ignore case
        }

        if (this.type) {
            allFilters.push(`${this.type}=isnull=false`);
            if (this.type === "schedule") {
                // Alerts belonging to dashboard with evaluation frequency setting
                // have schedule field so we need to exclude them
                allFilters.push(`alert=isnull=true`);
            }
        }

        const authorFilter = buildFieldFilter("createdBy.id", this.author, this.authorFilterType);
        if (authorFilter) {
            allFilters.push(authorFilter);
        }

        const recipientFilter = buildFieldFilter("recipients.id", this.recipient, this.recipientFilterType);
        if (recipientFilter) {
            allFilters.push(recipientFilter);
        }

        if (this.externalRecipient) {
            allFilters.push(`externalRecipients.email=='${this.externalRecipient}'`);
        }

        if (this.user) {
            allFilters.push(`(createdBy.id=='${this.user}' or recipients.id=='${this.user}')`);
        }

        const dashboardFilter = buildFieldFilter(
            "analyticalDashboard.id",
            this.dashboard,
            this.dashboardFilterType,
        );
        if (dashboardFilter) {
            allFilters.push(dashboardFilter);
        }

        // NEVER_RUN is not a valid status and cannot be used in RSQL, we have to handle it separately
        const statusFilter = buildStatusFilter(this.status, this.statusFilterType);
        if (statusFilter) {
            allFilters.push(statusFilter);
        }

        return allFilters.length > 0 ? { filter: allFilters.join(";") } : {};
    };
}
