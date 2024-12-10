// (C) 2024 GoodData Corporation

import { ServerPaging } from "@gooddata/sdk-backend-base";
import { INotificationsQuery, INotificationsQueryResult } from "@gooddata/sdk-backend-spi";
import { INotification } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import { convertNotificationFromBackend } from "../../convertors/fromBackend/NotificationsConvertor.js";
import { AutomationActionsApiGetNotificationsRequest } from "@gooddata/api-client-tiger";
import isNil from "lodash/isNil.js";

export class NotificationsQuery implements INotificationsQuery {
    private size = 100;
    private page = 0;
    private workspaceId?: string;
    private totalCount: number | undefined = undefined;

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

    query(): Promise<INotificationsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const params: AutomationActionsApiGetNotificationsRequest = {
                    workspaceId: this.workspaceId,
                    page: String(offset / limit),
                    size: String(limit),
                    metaInclude: ["total", "ALL"],
                };

                const response = await this.authCall((client) => client.automation.getNotifications(params));

                const items = response.data.data.map(convertNotificationFromBackend);
                const totalCount = response.data.meta.total?.all ?? 0;
                if (!isNil(totalCount)) {
                    this.setTotalCount(totalCount);
                }

                return { items, totalCount: this.totalCount! };
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
