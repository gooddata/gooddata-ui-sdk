// (C) 2025-2026 GoodData Corporation

import { useEffect, useRef, useState } from "react";

import { useIntl } from "react-intl";

type Props = {
    isLoading: boolean;
};

export function QualityScoreCardAnnouncements({ isLoading }: Props) {
    const intl = useIntl();
    const prevIsLoadingRef = useRef<boolean | null>(null);
    const [statusAnnouncement, setStatusAnnouncement] = useState<string>("");

    const runningAnnouncement = intl.formatMessage({
        id: "analyticsCatalog.quality.scoreCard.status.running",
    });
    const finishedAnnouncement = intl.formatMessage({
        id: "analyticsCatalog.quality.scoreCard.status.finished",
    });

    useEffect(() => {
        if (isLoading) {
            setStatusAnnouncement(runningAnnouncement);
        } else if (prevIsLoadingRef.current) {
            // Announce only after a previously running state to avoid noise on initial load.
            setStatusAnnouncement(finishedAnnouncement);
        }
        prevIsLoadingRef.current = isLoading;
    }, [isLoading, runningAnnouncement, finishedAnnouncement]);

    return (
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {statusAnnouncement}
        </div>
    );
}
