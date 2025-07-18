// (C) 2021-2025 GoodData Corporation
import { useIntl } from "react-intl";
import { NoData } from "@gooddata/sdk-ui-kit";

/**
 * A component that displays a message that Attribute Filer has any elements.
 * @beta
 */
export function AttributeFilterEmptyAttributeResult() {
    const intl = useIntl();

    return <NoData noDataLabel={intl.formatMessage({ id: "attributesDropdown.noData" })} />;
}
