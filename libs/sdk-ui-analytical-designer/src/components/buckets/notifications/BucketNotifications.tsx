// (C) 2020-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import classNames from "classnames";
import { FormattedMessage, defineMessage } from "react-intl";
import { useSelector } from "react-redux";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { getRemovedItems } from "../../../store/bucket_notifications/bucket_notifications_selector.js";
import { type IRemovedItems } from "../../../store/bucket_notifications/bucket_notifications_types.js";

import { type IHiddenItems, hiddenBucketItemsSelector } from "./hidden_bucket_items_selector.js";

export interface IBucketNotificationsStateProps {
    removedBucketItems: IRemovedItems;
    hiddenBucketItems: IHiddenItems;
}

interface IBucketNotificationProps {
    iconClassName: string;
    testClassNames: string[];
    message: ReactElement;
    tooltipMessage: ReactElement;
}

const getNumberOfAffectedItems = (items: IRemovedItems | IHiddenItems): number => {
    const { measures, measureValueFilters, rankingFilter } = items;
    const attributes = (items as IHiddenItems).attributes || 0;
    return attributes + measures + measureValueFilters + (rankingFilter ? 1 : 0);
};

function ListItem({ value, messageId }: { value: number; messageId: string }) {
    return (
        value > 0 && (
            <li>
                <FormattedMessage id={messageId} values={{ value }} />
            </li>
        )
    );
}

function TooltipMessage({
    headerMessageId,
    items,
}: {
    headerMessageId: string;
    items: IRemovedItems | IHiddenItems;
}) {
    const { measures, measureValueFilters, rankingFilter } = items;
    const attributes = (items as IHiddenItems).attributes || 0;
    return (
        <>
            <FormattedMessage id={headerMessageId} />
            <ul>
                <ListItem
                    messageId={defineMessage({ id: "bucket_notification.tooltip.items.attributes" }).id}
                    value={attributes}
                />
                <ListItem
                    messageId={defineMessage({ id: "bucket_notification.tooltip.items.measures" }).id}
                    value={measures}
                />
                <ListItem
                    messageId={
                        defineMessage({ id: "bucket_notification.tooltip.items.measureValueFilters" }).id
                    }
                    value={measureValueFilters}
                />
                <ListItem
                    messageId={defineMessage({ id: "bucket_notification.tooltip.items.rankingFilter" }).id}
                    value={rankingFilter ? 1 : 0}
                />
            </ul>
        </>
    );
}

const buildRemovedItemsNotification = (items: IRemovedItems): IBucketNotificationProps => {
    const { measures, measureValueFilters, rankingFilter } = items;
    const numberOfAffectedItems = getNumberOfAffectedItems(items);

    const messageId =
        numberOfAffectedItems === 1
            ? defineMessage({ id: "bucket_notification.body.removedItem" }).id
            : defineMessage({ id: "bucket_notification.body.removedItems" }).id;

    const tooltipMessageId =
        numberOfAffectedItems === 1
            ? defineMessage({ id: "bucket_notification.tooltip.removedItem" }).id
            : defineMessage({ id: "bucket_notification.tooltip.removedItems" }).id;

    return {
        iconClassName: "bucket-notification-icon--removed-items",
        testClassNames: [
            "s-removed-items-notification",
            `s-removed-items-notification--m-${measures}--mvf-${measureValueFilters}--rf-${rankingFilter}`,
        ],
        message: <FormattedMessage id={messageId} />,
        tooltipMessage: <TooltipMessage headerMessageId={tooltipMessageId} items={items} />,
    };
};

const buildHiddenItemsNotification = (items: IHiddenItems): IBucketNotificationProps => {
    const { attributes, measures, measureValueFilters, rankingFilter } = items;
    const numberOfAffectedItems = getNumberOfAffectedItems(items);

    const messageId =
        numberOfAffectedItems === 1
            ? defineMessage({ id: "bucket_notification.body.hiddenItem" }).id
            : defineMessage({ id: "bucket_notification.body.hiddenItems" }).id;

    const tooltipMessageId =
        numberOfAffectedItems === 1
            ? defineMessage({ id: "bucket_notification.tooltip.hiddenItem" }).id
            : defineMessage({ id: "bucket_notification.tooltip.hiddenItems" }).id;

    return {
        iconClassName: "bucket-notification-icon--hidden-items",
        testClassNames: [
            "s-hidden-items-notification",
            `s-hidden-items-notification--a-${attributes}--m-${measures}--mvf-${measureValueFilters}--rf-${rankingFilter}`,
        ],
        message: <FormattedMessage id={messageId} />,
        tooltipMessage: <TooltipMessage headerMessageId={tooltipMessageId} items={items} />,
    };
};

const useNotifications = (props: IBucketNotificationsStateProps): IBucketNotificationProps[] => {
    const { removedBucketItems, hiddenBucketItems } = props;
    return useMemo(() => {
        const items: IBucketNotificationProps[] = [];
        if (removedBucketItems) {
            items.push(buildRemovedItemsNotification(removedBucketItems));
        }
        if (hiddenBucketItems) {
            items.push(buildHiddenItemsNotification(hiddenBucketItems));
        }
        return items;
    }, [removedBucketItems, hiddenBucketItems]);
};

function BucketNotification({
    message,
    tooltipMessage,
    testClassNames,
    iconClassName,
}: IBucketNotificationProps) {
    const wrapperClassNames = classNames("bucket-notification", ...testClassNames);
    return (
        <BubbleHoverTrigger tagName={"div"} showDelay={200} hideDelay={0} className={wrapperClassNames}>
            <>
                <div className={classNames("bucket-notification-icon", iconClassName)} />
                <div className="bucket-notification-message s-bucket-notification-message">{message}</div>
            </>
            <Bubble alignPoints={[{ align: "tc bc" }]}>
                <div className="bucket-notification-tooltip s-bucket-notification-tooltip">
                    {tooltipMessage}
                </div>
            </Bubble>
        </BubbleHoverTrigger>
    );
}

export function BucketNotifications() {
    const removedBucketItems = useSelector(getRemovedItems);
    const hiddenBucketItems = useSelector(hiddenBucketItemsSelector);

    const notifications: IBucketNotificationProps[] = useNotifications({
        removedBucketItems,
        hiddenBucketItems,
    });
    return (
        notifications.length > 0 && (
            <div className="adi-bucket bucket-notifications has-rounded-corners s-bucket-notifications">
                {notifications.map((notificationProps) => (
                    <BucketNotification {...notificationProps} key={notificationProps.iconClassName} />
                ))}
            </div>
        )
    );
}
