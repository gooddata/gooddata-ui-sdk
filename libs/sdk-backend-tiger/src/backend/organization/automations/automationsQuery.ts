// (C) 2024-2025 GoodData Corporation

import isNil from "lodash/isNil.js";

import {
    AutomationOrganizationViewControllerApi,
    AutomationOrganizationViewControllerApiGetAllAutomationsWorkspaceAutomationsRequest,
} from "@gooddata/api-client-tiger";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    IGetOrganizationAutomationsQueryOptions,
    IOrganizationAutomationsQuery,
    IOrganizationAutomationsQueryResult,
    OrganizationAutomationType,
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
    private isAuthorMultiValue = false;
    private recipient: string | null = null;
    private isRecipientMultiValue = false;
    private externalRecipient: string | null = null;
    private user: string | null = null;
    private dashboard: string | null = null;
    private isDashboardMultiValue = false;
    private status: string | null = null;
    private isStatusMultiValue = false;
    private workspace: string | null = null;
    private isWorkspaceMultiValue = false;
    private filter: { title?: string } = {};
    private sort = {};
    private type: OrganizationAutomationType | undefined = undefined;
    private totalCount: number | undefined = undefined;

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly options?: IGetOrganizationAutomationsQueryOptions,
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

    public withType(type: OrganizationAutomationType): IOrganizationAutomationsQuery {
        this.type = type;
        return this;
    }

    public withAuthor(author: string, multiValue?: boolean): IOrganizationAutomationsQuery {
        this.author = author;
        this.isAuthorMultiValue = multiValue || false;
        return this;
    }

    public withRecipient(recipient: string, multiValue?: boolean): IOrganizationAutomationsQuery {
        this.recipient = recipient;
        this.isRecipientMultiValue = multiValue || false;
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

    public withDashboard(dashboard: string, multiValue?: boolean): IOrganizationAutomationsQuery {
        this.dashboard = dashboard;
        this.isDashboardMultiValue = multiValue || false;
        return this;
    }

    public withStatus(status: string, multiValue?: boolean): IOrganizationAutomationsQuery {
        this.status = status;
        this.isStatusMultiValue = multiValue || false;
        return this;
    }

    public withWorkspace(workspace: string, multiValue?: boolean): IOrganizationAutomationsQuery {
        this.workspace = workspace;
        this.isWorkspaceMultiValue = multiValue || false;
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
                            res.data.included ?? [],
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
            if (this.isAuthorMultiValue) {
                allFilters.push(`createdBy.id=in=(${this.author})`);
            } else {
                allFilters.push(`createdBy.id=='${this.author}'`);
            }
        }

        if (this.recipient) {
            if (this.isRecipientMultiValue) {
                allFilters.push(`recipients.id=in=(${this.recipient})`);
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
            if (this.isDashboardMultiValue) {
                allFilters.push(`analyticalDashboard.id=in=(${this.dashboard})`);
            } else {
                allFilters.push(`analyticalDashboard.id=='${this.dashboard}'`);
            }
        }

        if (this.workspace) {
            if (this.isWorkspaceMultiValue) {
                allFilters.push(`workspaceId=in=(${this.workspace})`);
            } else {
                allFilters.push(`workspaceId=='${this.workspace}'`);
            }
        }

        // NEVER_RUN is not a valid status and cannot be used in RSQL, we have to handle it separately
        if (this.status) {
            if (this.isStatusMultiValue) {
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
