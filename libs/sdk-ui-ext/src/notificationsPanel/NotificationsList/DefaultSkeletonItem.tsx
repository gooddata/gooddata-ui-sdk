// (C) 2024-2025 GoodData Corporation
import { UiSkeleton } from "@gooddata/sdk-ui-kit";

/**
 * Props for the NotificationSkeletonItem component.
 *
 * @public
 */
export interface INotificationSkeletonItemComponentProps {
    /**
     * Height of the skeleton item in pixels.
     */
    itemHeight: number;
}

/**
 * Default implementation of the NotificationSkeletonItem component.
 *
 * @public
 */
export const DefaultNotificationSkeletonItem = UiSkeleton;
