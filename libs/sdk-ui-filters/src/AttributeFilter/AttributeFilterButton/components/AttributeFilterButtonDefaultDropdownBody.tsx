// (C) 2022 GoodData Corporation
import React from "react";
import {
    AttributeDropdownBody,
    IAttributeDropdownBodyProps,
} from "../../AttributeDropdown/AttributeDropdownBody";
import { MediaQueries } from "../../../constants";
import { AttributeDropdownAllFilteredOutBody } from "../../AttributeDropdown/AttributeDropdownAllFilteredOutBody";
import MediaQuery from "react-responsive";
import { useIntl } from "react-intl";
import { NoData } from "@gooddata/sdk-ui-kit";

interface IAttributeFilterButtonDefaultDropdownBodyProps {
    allElementsFiltered: boolean;
    onApplyButtonClicked: (closeDropdown: () => void) => void;
    closeDropdown: () => void;
    hasNoData: boolean;
    bodyProps: IAttributeDropdownBodyProps;
}

const AttributeFilterButtonDefaultDropdownBody: React.FC<IAttributeFilterButtonDefaultDropdownBodyProps> = (
    props,
) => {
    const { allElementsFiltered, onApplyButtonClicked, closeDropdown, hasNoData, bodyProps } = props;

    const intl = useIntl();
    // function renderDefaultBody(bodyProps: IAttributeDropdownBodyProps, closeDropdown: () => void) {
    return allElementsFiltered ? (
        <MediaQuery query={MediaQueries.IS_MOBILE_DEVICE}>
            {(isMobile) => (
                <AttributeDropdownAllFilteredOutBody
                    parentFilterTitles={bodyProps.parentFilterTitles}
                    onApplyButtonClick={() => onApplyButtonClicked(closeDropdown)}
                    onCancelButtonClick={closeDropdown}
                    isMobile={isMobile}
                />
            )}
        </MediaQuery>
    ) : hasNoData ? (
        <NoData noDataLabel={intl.formatMessage({ id: "attributesDropdown.noData" })} />
    ) : (
        <AttributeDropdownBody {...bodyProps} isMobile={bodyProps.isFullWidth} />
    );
};

export default AttributeFilterButtonDefaultDropdownBody;
