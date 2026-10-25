// (C) 2022-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { type IShowAllValuesSectionExternalProps, ShowAllValuesSection } from "./ShowAllValuesSection.js";

type IShowAllAttributeValuesSectionProps = IShowAllValuesSectionExternalProps;

export function ShowAllAttributeValuesSection(props: IShowAllAttributeValuesSectionProps) {
    const intl = useIntl();

    const label = intl.formatMessage({ id: "dashboard.bucket_item.show_all_values" });
    const tooltip = intl.formatMessage({ id: "dashboard.bucket_item.show_all_values.attribute.tooltip" });

    return <ShowAllValuesSection {...props} label={label} tooltip={tooltip} />;
}
