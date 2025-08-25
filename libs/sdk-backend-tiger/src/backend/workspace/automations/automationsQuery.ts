// (C) 2024-2025 GoodData Corporation

import isNil from "lodash/isNil.js";

import { EntitiesApiGetAllEntitiesAutomationsRequest, MetadataUtilities } from "@gooddata/api-client-tiger";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    AutomationType,
    IAutomationsQuery,
    IAutomationsQueryResult,
    IGetAutomationsQueryOptions,
} from "@gooddata/sdk-backend-spi";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";

import { convertAutomationListToAutomations } from "../../../convertors/fromBackend/AutomationConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { getSettingsForCurrentUser } from "../settings/index.js";

const STATUS_NEVER_RUN = "NEVER_RUN";
const STATUS_NEVER_RUN_RSQL_QUERY = `automationResults.status=isnull=true`;

export class AutomationsQuery implements IAutomationsQuery {
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

    withAuthor(author: string, multiValue?: boolean): IAutomationsQuery {
        this.author = author;
        this.isAuthorMultiValue = multiValue || false;
        return this;
    }

    withRecipient(recipient: string, multiValue?: boolean): IAutomationsQuery {
        this.recipient = recipient;
        this.isRecipientMultiValue = multiValue || false;
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

    withDashboard(dashboard: string, multiValue?: boolean): IAutomationsQuery {
        this.dashboard = dashboard;
        this.isDashboardMultiValue = multiValue || false;
        return this;
    }

    withStatus(status: string, multiValue?: boolean): IAutomationsQuery {
        this.status = status;
        this.isStatusMultiValue = multiValue || false;
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
                    client.entities.getAllEntitiesAutomations({
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
                        if (!isNil(totalCount)) {
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
        const allFilters = [];

        if (this.filter.title) {
            allFilters.push(`title=containsic=${this.filter.title}`); // contains + ignore case
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
