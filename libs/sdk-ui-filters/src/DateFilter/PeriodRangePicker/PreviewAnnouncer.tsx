// (C) 2026 GoodData Corporation

import { useEffect, useRef, useState } from "react";

/**
 * How long a spent announcement lingers in the region before it is removed.
 *
 * @remarks
 * It only has to be long enough that the removal cannot be mistaken for the replacement of a message that
 * is still being announced - a screen reader takes its copy of the text when the DOM changes, so removing
 * the node afterwards does not cut the speech short.
 */
export const ANNOUNCEMENT_LIFETIME = 3000;

interface IAnnouncement {
    id: number;
    text: string;
}

interface IPreviewAnnouncerProps {
    /**
     * The message to announce. A new value is announced once; `null` announces nothing and leaves whatever
     * is still pending to expire on its own.
     */
    message: string | null;
}

/**
 * A visually hidden live region that announces each message once and then empties itself.
 */
export function PreviewAnnouncer({ message }: IPreviewAnnouncerProps) {
    const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
    const nextIdRef = useRef(0);
    const timeoutsRef = useRef(new Set<number>());

    useEffect(() => {
        if (!message) {
            return;
        }

        const id = nextIdRef.current++;
        setAnnouncements((current) => [...current, { id, text: message }]);

        const timeout = window.setTimeout(() => {
            timeoutsRef.current.delete(timeout);
            setAnnouncements((current) => current.filter((announcement) => announcement.id !== id));
        }, ANNOUNCEMENT_LIFETIME);
        timeoutsRef.current.add(timeout);
    }, [message]);

    useEffect(() => {
        const timeouts = timeoutsRef.current;
        return () => {
            timeouts.forEach((timeout) => window.clearTimeout(timeout));
            timeouts.clear();
        };
    }, []);

    return (
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {announcements.map(({ id, text }) => (
                <div key={id}>{text}</div>
            ))}
        </div>
    );
}
