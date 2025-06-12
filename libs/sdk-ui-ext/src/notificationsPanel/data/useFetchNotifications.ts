// (C) 2024-2025 GoodData Corporation
import { GoodDataSdkError, useCancelablePromise, useWorkspace } from "@gooddata/sdk-ui";
import { useOrganization } from "../@staging/OrganizationContext/OrganizationContext.js";
import { INotification } from "@gooddata/sdk-model";
import { useCallback, useEffect, useState } from "react";
import { INotificationsQueryResult } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export interface IUseFetchNotificationsProps {
    /**
     * Filter notifications by workspace.
     */
    workspace?: string;

    /**
     * Filter notifications by status.
     */
    readStatus?: "unread" | "read";

    /**
     * Refresh interval in milliseconds.
     */
    refreshInterval: number;

    /**
     * Number of items to fetch per page.
     */
    itemsPerPage: number;
}

/**
 * @internal
 */
export function useFetchNotifications({
    workspace,
    readStatus,
    refreshInterval,
    itemsPerPage,
}: IUseFetchNotificationsProps) {
    const effectiveWorkspace = useWorkspace(workspace);
    const { result: organizationService } = useOrganization();
    const [page, setPage] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [totalNotificationsCount, setTotalNotificationsCount] = useState(0);
    const [invalidationId, setInvalidationId] = useState<number>(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (refreshInterval > 0) {
            interval = setInterval(() => {
                setPage(0);
                setNotifications([]);
                setInvalidationId((x) => x + 1);
            }, refreshInterval);
        }

        return () => {
            clearInterval(interval);
        };
    }, [refreshInterval]);

    const { status, error } = useCancelablePromise<INotificationsQueryResult, GoodDataSdkError>(
        {
            promise: !organizationService
                ? null
                : async () => {
                      let query = organizationService.notifications().getNotificationsQuery();

                      if (effectiveWorkspace) {
                          query = query.withWorkspace(effectiveWorkspace);
                      }

                      if (itemsPerPage) {
                          query = query.withSize(itemsPerPage);
                      }

                      if (page) {
                          query = query.withPage(page);
                      }

                      if (readStatus) {
                          query = query.withStatus(readStatus);
                      }

                      return query.query();
                  },
            onSuccess: (result) => {
                const hasNextPage = result.totalCount > (page + 1) * itemsPerPage;
                setHasNextPage(hasNextPage);
                setNotifications((prev) => [...prev, ...result.items]);
                setTotalNotificationsCount(result.totalCount);
            },
        },
        [effectiveWorkspace, organizationService, page, invalidationId],
    );

    const loadNextPage = useCallback(() => {
        if (status === "success" && hasNextPage) {
            setPage((x) => x + 1);
        }
    }, [status, hasNextPage]);

    const reset = useCallback(() => {
        setPage(0);
        setNotifications([]);
        setHasNextPage(false);
        setTotalNotificationsCount(0);
        setInvalidationId((x) => x + 1);
    }, []);

    return {
        status,
        error,
        hasNextPage,
        notifications,
        totalNotificationsCount,
        loadNextPage,
        reset,
    };
}
