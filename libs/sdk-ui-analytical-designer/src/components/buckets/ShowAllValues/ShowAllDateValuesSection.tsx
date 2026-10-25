// (C) 2022-2026 GoodData Corporation

import { defineMessage, useIntl } from "react-intl";

import {
    type Granularity,
    type IGranularityOption,
    isChronologicalDateGranularity,
} from "../../../models/granularity.js";

import { type IShowAllValuesSectionExternalProps, ShowAllValuesSection } from "./ShowAllValuesSection.js";

interface IShowAllDateValuesOwnSection {
    granularityOptions: IGranularityOption[];
    selectedGranularity: Granularity;
}

type IShowAllDateValuesSectionProps = IShowAllDateValuesOwnSection & IShowAllValuesSectionExternalProps;

const isChronological = (granularityOptions: IGranularityOption[], selectedGranularity: Granularity) => {
    const selectedGranularityOption = granularityOptions.find(
        (granularityOption) => granularityOption.dateType === selectedGranularity,
    );
    return isChronologicalDateGranularity(selectedGranularityOption);
};

export function ShowAllDateValuesSection(props: IShowAllDateValuesSectionProps) {
    const intl = useIntl();

    const { granularityOptions, selectedGranularity } = props;
    const chronological = isChronological(granularityOptions, selectedGranularity);
    const label = intl.formatMessage(defineMessage({ id: "dashboard.bucket_item.show_all_values" }));
    const chronologicalTooltip = intl.formatMessage(
        defineMessage({ id: "dashboard.bucket_item.show_all_values.chronological.date.attributes.tooltip" }),
    );
    const genericTooltip = intl.formatMessage(
        defineMessage({ id: "dashboard.bucket_item.show_all_values.generic.date.attribute.tooltip" }),
    );

    return (
        <ShowAllValuesSection
            {...props}
            className="s-show-all-attribute-values"
            label={label}
            tooltip={chronological ? chronologicalTooltip : genericTooltip}
        />
    );
}
