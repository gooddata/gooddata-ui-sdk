// (C) 2024-2025 GoodData Corporation

import isNil from "lodash/isNil.js";

import {
    AutomationOrganizationViewControllerApi,
    AutomationOrganizationViewControllerApiGetAllAutomationsWorkspaceAutomationsRequest,
    JsonApiAutomationOutIncludes,
} from "@gooddata/api-client-tiger";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    AutomationFilterType,
    AutomationType,
    IGetAutomationsQueryOptions,
    IOrganizationAutomationsQuery,
    IOrganizationAutomationsQueryResult,
} from "@gooddata/sdk-backend-spi";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";

import { convertAutomation } from "../../../convertors/fromBackend/AutomationConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

const STATUS_NEVER_RUN = "NEVER_RUN";
const STATUS_NEVER_RUN_RSQL_QUERY = `automationResults.status=isnull=true`;

/**
 * Organization automations query implementation for centralized automation management.
 *
 * @alpha
 */
export class OrganizationAutomationsQuery implements IOrganizationAutomationsQuery {
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
    private workspace: string | null = null;
    private workspaceFilterType: AutomationFilterType = "exact";
    private filter: { title?: string } = {};
    private sort = {};
    private type: AutomationType | undefined = undefined;
    private totalCount: number | undefined = undefined;

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly options?: IGetAutomationsQueryOptions,
    ) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    public withSize(size: number): IOrganizationAutomationsQuery {
        this.size = size;
        return this;
    }

    public withPage(page: number): IOrganizationAutomationsQuery {
        this.page = page;
        return this;
    }

    public withFilter(filter: { title?: string }): IOrganizationAutomationsQuery {
        this.filter = { ...filter };
        // Reset total count whenever filter changes
        this.setTotalCount(undefined);
        return this;
    }

    public withSorting(sort: string[]): IOrganizationAutomationsQuery {
        this.sort = { sort };
        return this;
    }

    public withType(type: AutomationType): IOrganizationAutomationsQuery {
        this.type = type;
        return this;
    }

    public withAuthor(
        author: string,
        filterType: AutomationFilterType = "exact",
    ): IOrganizationAutomationsQuery {
        this.author = author;
        this.authorFilterType = filterType;
        return this;
    }

    public withRecipient(
        recipient: string,
        filterType: AutomationFilterType = "exact",
    ): IOrganizationAutomationsQuery {
        this.recipient = recipient;
        this.recipientFilterType = filterType;
        return this;
    }

    public withExternalRecipient(externalRecipient: string): IOrganizationAutomationsQuery {
        this.externalRecipient = externalRecipient;
        return this;
    }

    public withUser(user: string): IOrganizationAutomationsQuery {
        this.user = user;
        return this;
    }

    public withDashboard(
        dashboard: string,
        filterType: AutomationFilterType = "exact",
    ): IOrganizationAutomationsQuery {
        this.dashboard = dashboard;
        this.dashboardFilterType = filterType;
        return this;
    }

    public withStatus(
        status: string,
        filterType: AutomationFilterType = "exact",
    ): IOrganizationAutomationsQuery {
        this.status = status;
        this.statusFilterType = filterType;
        return this;
    }

    public withWorkspace(
        workspace: string,
        filterType: AutomationFilterType = "exact",
    ): IOrganizationAutomationsQuery {
        this.workspace = workspace;
        this.workspaceFilterType = filterType;
        return this;
    }

    public query(): Promise<IOrganizationAutomationsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                /**
                 * For backend performance reasons, we do not want to ask for paging info each time.
                 */
                const metaIncludeObj =
                    this.totalCount === undefined ? { metaInclude: ["page" as const] } : {};

                const filterObj = this.constructFilter();

                const includeAutomationResult = this.options?.includeAutomationResult
                    ? ["automationResults" as const]
                    : [];

                // Note: Organization-level automations always include user data
                const enableAutomationFilterContext = true;
                const enableNewScheduledExport = false;

                const requestParams: AutomationOrganizationViewControllerApiGetAllAutomationsWorkspaceAutomationsRequest =
                    {
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
                            "workspace",
                            ...includeAutomationResult,
                        ],
                        size: limit,
                        page: offset / limit,
                    };

                const items = await this.authCall((client) => {
                    const orgController = new AutomationOrganizationViewControllerApi(
                        undefined,
                        "",
                        client.axios,
                    );
                    return orgController.getAllAutomationsWorkspaceAutomations(requestParams);
                }).then((res) => {
                    const totalCount = res.data.meta?.page?.totalElements;
                    if (!isNil(totalCount)) {
                        this.setTotalCount(totalCount);
                    }
                    // Convert workspace automation list to standard automation objects
                    return res.data.data.map((automationObject) =>
                        convertAutomation(
                            automationObject,
                            (res.data?.included ?? []) as JsonApiAutomationOutIncludes[],
                            enableAutomationFilterContext,
                            enableNewScheduledExport,
                        ),
                    );
                });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }

    public async queryAll(): Promise<IAutomationMetadataObject[]> {
        const firstQuery = await this.query();
        return firstQuery.all();
    }

    private constructFilter = () => {
        const allFilters = [];

        if (this.filter.title) {
            allFilters.push(`title=containsic='${this.filter.title}'`); // contains + ignore case
        }

        if (this.type) {
            allFilters.push(`${this.type}=isnull=false`);
        }

        if (this.author) {
            if (this.authorFilterType === "include") {
                allFilters.push(`createdBy.id=in=(${this.author})`);
            } else if (this.authorFilterType === "exclude") {
                allFilters.push(`createdBy.id=out=(${this.author})`);
            } else {
                allFilters.push(`createdBy.id=='${this.author}'`);
            }
        }

        if (this.recipient) {
            if (this.recipientFilterType === "include") {
                allFilters.push(`recipients.id=in=(${this.recipient})`);
            } else if (this.recipientFilterType === "exclude") {
                allFilters.push(`recipients.id=out=(${this.recipient})`);
            } else {
                allFilters.push(`recipients.id=='${this.recipient}'`);
            }
        }

        if (this.externalRecipient) {
            allFilters.push(`externalRecipients.email=='${this.externalRecipient}'`);
        }

        if (this.user) {
            allFilters.push(`(createdBy.id=='${this.user}' or recipients.id=='${this.user}')`);
        }

        if (this.dashboard) {
            if (this.dashboardFilterType === "include") {
                allFilters.push(`analyticalDashboard.id=in=(${this.dashboard})`);
            } else if (this.dashboardFilterType === "exclude") {
                allFilters.push(`analyticalDashboard.id=out=(${this.dashboard})`);
            } else {
                allFilters.push(`analyticalDashboard.id=='${this.dashboard}'`);
            }
        }

        if (this.workspace) {
            if (this.workspaceFilterType === "include") {
                allFilters.push(`workspace.id=in=(${this.workspace})`);
            } else if (this.workspaceFilterType === "exclude") {
                allFilters.push(`workspace.id=out=(${this.workspace})`);
            } else {
                allFilters.push(`workspace.id=='${this.workspace}'`);
            }
        }

        // NEVER_RUN is not a valid status and cannot be used in RSQL, we have to handle it separately
        if (this.status) {
            if (this.statusFilterType === "include") {
                const statuses = this.status.split(",");
                const hasNeverRun = statuses.includes(STATUS_NEVER_RUN);

                if (hasNeverRun) {
                    const otherStatuses = statuses.filter((s) => s !== STATUS_NEVER_RUN);

                    if (otherStatuses.length > 0) {
                        const otherStatusesQueryValue = otherStatuses.join(",");
                        allFilters.push(
                            `(automationResults.status=in=(${otherStatusesQueryValue}) or ${STATUS_NEVER_RUN_RSQL_QUERY})`,
                        );
                    } else {
                        allFilters.push(STATUS_NEVER_RUN_RSQL_QUERY);
                    }
                } else {
                    allFilters.push(`automationResults.status=in=(${this.status})`);
                }
            } else {
                if (this.status === STATUS_NEVER_RUN) {
                    allFilters.push(STATUS_NEVER_RUN_RSQL_QUERY);
                } else {
                    allFilters.push(`automationResults.status=='${this.status}'`);
                }
            }
        }

        return allFilters.length > 0 ? { filter: allFilters.join(";") } : {};
    };
}
