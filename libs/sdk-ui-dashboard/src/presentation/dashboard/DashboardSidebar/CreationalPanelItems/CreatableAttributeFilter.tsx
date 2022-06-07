// (C) 2007-2022 GoodData Corporation
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import React from "react";
import { FormattedMessage } from "react-intl";
import { DraggableAttributeFilterPlaceholder } from "../../../dragAndDrop";
import { AddAttributeFilterPlaceholder } from "../../../filterBar";
import { useDashboardSelector } from "../../../../model";
import { selectHasCatalogAttributes } from "../../../../model/store/catalog/catalogSelectors";
import { selectIsWhiteLabeled } from "../../../../model/store/config/configSelectors";

export function CreatableAttributeFilter() {
    const hasAttributes = useDashboardSelector(selectHasCatalogAttributes);
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);

    const disabled = !hasAttributes;

    const tooltip = disabled && !hasAttributes && (
        <div>
            <FormattedMessage id="addPanel.attributeFilter.tooltip.no_attributes" />
            &nbsp;
            {!isWhiteLabeled && (
                <a
                    href="https://help.gooddata.com/display/doc/Attributes+in+Logical+Data+Models"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="s-add-attribute-filter-tooltip-link"
                >
                    <FormattedMessage id="addPanel.attributeFilter.tooltip.no_attributes.link" />
                </a>
            )}
        </div>
    );

    return (
        <BubbleHoverTrigger eventsOnBubble={true} className="s-add-attribute-filter-bubble-trigger">
            <DraggableAttributeFilterPlaceholder
                PlaceholderComponent={AddAttributeFilterPlaceholder}
                placeholderComponentProps={{ disabled }}
            />

            {tooltip && (
                <Bubble alignPoints={[{ align: "cr cl", offset: { x: -20, y: 0 } }]}>{tooltip}</Bubble>
            )}
        </BubbleHoverTrigger>
    );
}
