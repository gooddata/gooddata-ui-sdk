// (C) 2024-2025 GoodData Corporation

import { ServerPaging } from "@gooddata/sdk-backend-base";
import { INotificationsQuery, INotificationsQueryResult } from "@gooddata/sdk-backend-spi";
import { INotification } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import { convertNotificationFromBackend } from "../../convertors/fromBackend/NotificationsConvertor.js";
import { ActionsAutomationGetNotificationsRequest } from "@gooddata/api-client-tiger";
import isNil from "lodash/isNil.js";

export class NotificationsQuery implements INotificationsQuery {
    private size = 100;
    private page = 0;
    private workspaceId?: string;
    private totalCount: number | undefined = undefined;
    private status: "read" | "unread" | undefined = undefined;

    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withSize(size: number): INotificationsQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): INotificationsQuery {
        this.page = page;
        return this;
    }

    withWorkspace(workspaceId: string): INotificationsQuery {
        this.workspaceId = workspaceId;
        return this;
    }

    withStatus(status: "read" | "unread"): INotificationsQuery {
        this.status = status;
        return this;
    }

    query(): Promise<INotificationsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                let params: ActionsAutomationGetNotificationsRequest = {
                    workspaceId: this.workspaceId,
                    page: String(offset / limit),
                    size: String(limit),
                    metaInclude: ["total", "ALL"],
                };

                if (this.status) {
                    if (this.status === "read") {
                        params = {
                            ...params,
                            isRead: true,
                        };
                    } else if (this.status === "unread") {
                        params = {
                            ...params,
                            isRead: false,
                        };
                    }
                }

                const response = await this.authCall((client) => client.automation.getNotifications(params));

                const items = response.data.data.map(convertNotificationFromBackend);
                const totalCount = response.data.meta.total?.all ?? 0;
                if (!isNil(totalCount)) {
                    this.setTotalCount(totalCount);
                }

                return {
                    items,
                    totalCount:
                        this.status === "unread" ? (response.data.meta.total?.unread ?? 0) : this.totalCount!,
                };
            },
            this.size,
            this.page * this.size,
        );
    }

    async queryAll(): Promise<INotification[]> {
        const firstQuery = await this.query();
        return firstQuery.all();
    }
}
