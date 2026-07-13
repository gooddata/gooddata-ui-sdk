// (C) 2026 GoodData Corporation

import { useEffect } from "react";

import { type IHostUiNotification } from "@gooddata/sdk-pluggable-application-model";

interface IHostNotificationDispatcherProps {
    notification: IHostUiNotification | null;
}

/**
 * Handles runtime shell notifications pushed by the host runtime.
 *
 * A single component is enough to handle every notification type; new types should add a
 * branch in the effect below.
 *
 * @remarks
 * The `newDeploymentAvailable` notification used to surface a toast prompting the user to
 * reload. Per LX-2674 (agreed with UX) that toast is no longer shown: an unexpected reload
 * could make users lose unsaved work, and the banner carried GoodData branding that
 * white-labelled deployments must not expose. The runtime still detects redeploys (version
 * watcher) and stale chunks are still auto-recovered on the next failed import; we now only
 * trace the detection to the console rather than nag the user.
 */
export function HostNotificationDispatcher({ notification }: IHostNotificationDispatcherProps) {
    useEffect(() => {
        if (!notification) {
            return;
        }

        if (notification.type === "newDeploymentAvailable") {
            console.warn(
                `[host-runtime/notifications] A new deployment (${notification.commitHash}) is available; reload to load the latest build.`,
            );
        }
    }, [notification]);

    return null;
}
