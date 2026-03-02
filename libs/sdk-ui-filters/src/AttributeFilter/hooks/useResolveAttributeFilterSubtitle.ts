// (C) 2022-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { type IAttributeElement, type IAttributeFilter } from "@gooddata/sdk-model";

import { getFilterModeFromFilter } from "../filterModeUtils.js";
import { getAttributeFilterSubtitle, getExtendedAttributeFilterSubtitle } from "../utils.js";

/**
 * @internal
 */
export function useResolveAttributeFilterSubtitle(
    isCommittedSelectionInverted: boolean,
    committedSelectionElements: IAttributeElement[],
    filter?: IAttributeFilter,
) {
    const intl = useIntl();

    // For non-elements modes, use extended subtitle
    const mode = getFilterModeFromFilter(filter);
    if (mode !== "elements" && filter) {
        return getExtendedAttributeFilterSubtitle(filter, intl);
    }

    // For elements mode, use existing subtitle logic
    return getAttributeFilterSubtitle(isCommittedSelectionInverted, committedSelectionElements, intl);
}
