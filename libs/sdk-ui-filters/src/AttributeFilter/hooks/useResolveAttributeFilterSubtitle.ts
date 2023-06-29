// (C) 2022 GoodData Corporation
import { useIntl } from "react-intl";
import { IAttributeElement } from "@gooddata/sdk-model";
import { getElementTitles } from "../utils.js";

/**
 * @internal
 */
export function useResolveAttributeFilterSubtitle(
    isCommittedSelectionInverted: boolean,
    committedSelectionElements: IAttributeElement[],
) {
    const intl = useIntl();
    const isCommittedSelectionEmpty = committedSelectionElements.length === 0;

    const isNone = isCommittedSelectionEmpty && !isCommittedSelectionInverted;
    const isNegativeSelection = !isCommittedSelectionEmpty && isCommittedSelectionInverted;
    const isPositiveSelection = !isCommittedSelectionEmpty && !isCommittedSelectionInverted;

    let subtitle = intl.formatMessage({ id: "gs.list.all" });
    if (isNegativeSelection) {
        subtitle = `${intl.formatMessage({ id: "gs.list.all" })} ${intl.formatMessage({
            id: "gs.list.except",
        })} ${getElementTitles(committedSelectionElements, intl)}`;
    } else if (isPositiveSelection) {
        subtitle = getElementTitles(committedSelectionElements, intl);
    } else if (isNone) {
        subtitle = intl.formatMessage({ id: "gs.filterLabel.none" });
    }

    return subtitle;
}
