// (C) 2026 GoodData Corporation

import { useState } from "react";

import { defineMessages, useIntl } from "react-intl";

import { type IdentifierRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { type IAutomationParameter } from "./automationParameters.js";

const messages = defineMessages({
    added: { id: "automationParameters.announcement.added" },
    changed: { id: "automationParameters.announcement.changed" },
    removed: { id: "automationParameters.announcement.removed" },
});

/**
 * Owns the parameter screen-reader announcement string and how a parameter is named (its title, or
 * its identifier as fallback). Callers pass the relevant list and the acted-on ref.
 *
 * @internal
 */
export function useParameterAnnouncements(): {
    parameterAnnouncement: string;
    announceParameterAdded: (list: IAutomationParameter[], ref: IdentifierRef) => void;
    announceParameterChanged: (list: IAutomationParameter[], ref: IdentifierRef, value: number) => void;
    announceParameterRemoved: (list: IAutomationParameter[], ref: IdentifierRef) => void;
} {
    const intl = useIntl();
    const [parameterAnnouncement, setParameterAnnouncement] = useState("");

    return {
        parameterAnnouncement,
        announceParameterAdded: (list, ref) =>
            setParameterAnnouncement(
                intl.formatMessage(messages.added, { title: parameterTitle(list, ref) }),
            ),
        announceParameterChanged: (list, ref, value) =>
            setParameterAnnouncement(
                intl.formatMessage(messages.changed, { title: parameterTitle(list, ref), value }),
            ),
        announceParameterRemoved: (list, ref) =>
            setParameterAnnouncement(
                intl.formatMessage(messages.removed, { title: parameterTitle(list, ref) }),
            ),
    };
}

function parameterTitle(list: IAutomationParameter[], ref: IdentifierRef): string {
    return list.find((parameter) => areObjRefsEqual(parameter.ref, ref))?.title ?? ref.identifier;
}
