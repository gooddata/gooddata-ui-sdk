// (C) 2021-2026 GoodData Corporation

import classNames from "classnames";
import { FormattedMessage } from "react-intl";

import { Item } from "@gooddata/sdk-ui-kit";

import { type Granularity, type IGranularityOption } from "../../../models/granularity.js";

interface IMoreOptionsItemProps {
    selectedGranularity: Granularity;
    granularities: IGranularityOption[];
}

export function MoreOptionsItem({ selectedGranularity, granularities }: IMoreOptionsItemProps) {
    const selectedItem = granularities.find((granularity) => granularity.dateType === selectedGranularity);

    const cssClasses = classNames("s-granularity-more-options", {
        "is-selected": !!selectedItem?.chronologicalGranularity,
    });

    return (
        <Item subMenu className={cssClasses}>
            <span className="adi-date-granularity-more-options">
                <FormattedMessage id="granularity.moreOptions" />
            </span>
        </Item>
    );
}
