// (C) 2026 GoodData Corporation

import { useEffect, useRef, useState } from "react";

import { type IntlShape, defineMessages, useIntl } from "react-intl";

import { type IGenAIContextObject, type SelectedContext } from "../../types.js";

const msgs = defineMessages({
    added: {
        id: "gd.gen-ai.context.announcement.added",
    },
    removed: {
        id: "gd.gen-ai.context.announcement.removed",
    },
    switched: {
        id: "gd.gen-ai.context.announcement.switched",
    },
    empty: {
        id: "gd.gen-ai.context.announcement.empty",
    },
});

const ANNOUNCEMENT_DELAY = 250;

/**
 * Turns each change of the assistant context into one spoken sentence: what was added, what was
 * removed, that the whole context was swapped (the user navigated to another dashboard), or that
 * nothing is left.
 * @internal
 */
export function useContextChangeAnnouncement(
    selected: SelectedContext | undefined,
    references: IGenAIContextObject[],
    loading?: boolean,
): string {
    const intl = useIntl();
    const [announcement, setAnnouncement] = useState("");
    const announcedReferences = useRef<IGenAIContextObject[] | null>(null);

    useEffect(() => {
        if (loading) {
            return undefined;
        }

        const announced = announcedReferences.current;
        const all = [
            ...(selected?.activated && selected.dashboard ? [selected.dashboard] : []),
            ...(selected?.activated && selected.publisherDocument ? [selected.publisherDocument] : []),
            ...(selected?.activated && selected.visualization ? [selected.visualization] : []),
            ...references,
        ];

        if (announced === null) {
            announcedReferences.current = all;
            return undefined;
        }

        const message = getAnnouncement(announced, all, intl);
        if (!message) {
            return undefined;
        }

        setAnnouncement("");
        const timeout = setTimeout(() => {
            announcedReferences.current = all;
            setAnnouncement(message);
        }, ANNOUNCEMENT_DELAY);
        return () => clearTimeout(timeout);
    }, [references, intl, selected, loading]);

    return announcement;
}

function getAnnouncement(
    previous: IGenAIContextObject[],
    current: IGenAIContextObject[],
    intl: IntlShape,
): string | undefined {
    const added = current.filter((item) => !previous.some((other) => other.id === item.id));
    const removed = previous.filter((item) => !current.some((other) => other.id === item.id));

    if (added.length === 0 && removed.length === 0) {
        return undefined;
    }

    if (current.length === 0) {
        return intl.formatMessage(msgs.empty);
    }

    if (added.length > 0 && removed.length > 0) {
        return intl.formatMessage(msgs.switched, { titles: joinTitles(current) });
    }

    return added.length > 0
        ? intl.formatMessage(msgs.added, { titles: joinTitles(added) })
        : intl.formatMessage(msgs.removed, { titles: joinTitles(removed) });
}

function joinTitles(references: IGenAIContextObject[]): string {
    return references.map((reference) => reference.title).join(", ");
}
