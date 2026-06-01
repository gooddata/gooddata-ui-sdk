// (C) 2026 GoodData Corporation

import { useEffect } from "react";

import { FormattedMessage } from "react-intl";

import { type IHostUiNotification } from "@gooddata/sdk-pluggable-application-model";
import { ToastsCenterContext, UiLink } from "@gooddata/sdk-ui-kit";

interface IHostNotificationDispatcherProps {
    notification: IHostUiNotification | null;
}

/**
 * Bridges runtime shell notifications into the SDK toasts center.
 *
 * Lives inside the chrome's intl + toasts providers, so a single component is enough
 * to handle every notification type. New types should add a branch in the effect below.
 */
export function HostNotificationDispatcher({ notification }: IHostNotificationDispatcherProps) {
    const { addMessage, removeMessage } = ToastsCenterContext.useContextStoreValues([
        "addMessage",
        "removeMessage",
    ]);

    useEffect(() => {
        if (!notification) {
            return undefined;
        }

        if (notification.type === "newDeploymentAvailable") {
            const id = `host:newDeployment:${notification.commitHash}`;
            const onReload = (event: React.MouseEvent<HTMLAnchorElement>) => {
                event.preventDefault();
                window.location.reload();
            };
            addMessage({
                id,
                type: "warning",
                duration: 0,
                node: (
                    <span>
                        <FormattedMessage id="gs.host.notification.newDeployment.message" />{" "}
                        <UiLink variant="primary" href="#" onClick={onReload}>
                            <FormattedMessage id="gs.host.notification.newDeployment.reloadLink" />
                        </UiLink>
                    </span>
                ),
            });

            return () => {
                removeMessage(id);
            };
        }

        return undefined;
    }, [notification, addMessage, removeMessage]);

    return null;
}
