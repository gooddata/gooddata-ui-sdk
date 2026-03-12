// (C) 2026 GoodData Corporation

import { type LegendMessageFormatter } from "./legendMessages.js";
import { type ILegendGroup } from "../../types/legend/model.js";

/**
 * Resolves a localized legend group title when message metadata is present.
 *
 * @internal
 */
export function resolveLegendGroupTitle(group: ILegendGroup, formatMessage?: LegendMessageFormatter): string {
    if (group.titleMessageId && formatMessage) {
        const localizedTitle = formatMessage(group.titleMessageId, group.titleMessageValues);
        if (localizedTitle) {
            return localizedTitle;
        }
    }

    return group.title;
}
