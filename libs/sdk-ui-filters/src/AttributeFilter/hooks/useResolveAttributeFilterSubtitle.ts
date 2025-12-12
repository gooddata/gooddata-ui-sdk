// (C) 2022-2025 GoodData Corporation
import { useIntl } from "react-intl";

import { type IAttributeElement } from "@gooddata/sdk-model";

import { getAttributeFilterSubtitle } from "../utils.js";

/**
 * @internal
 */
export function useResolveAttributeFilterSubtitle(
    isCommittedSelectionInverted: boolean,
    committedSelectionElements: IAttributeElement[],
) {
    const intl = useIntl();
    return getAttributeFilterSubtitle(isCommittedSelectionInverted, committedSelectionElements, intl);
}
