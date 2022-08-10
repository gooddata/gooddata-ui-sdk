// (C) 2007-2022 GoodData Corporation
import React from "react";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";
import { DraggableAttributeFilterCreatePanelItem } from "../../dragAndDrop";
import { AddAttributeFilterPlaceholder } from "./addAttributeFilter";
import { useDashboardSelector, selectHasCatalogAttributes, selectIsWhiteLabeled } from "../../../model";

/**
 * @internal
 */
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
            <DraggableAttributeFilterCreatePanelItem
                CreatePanelItemComponent={AddAttributeFilterPlaceholder}
                createPanelItemComponentProps={{ disabled }}
            />

            {tooltip && (
                <Bubble alignPoints={[{ align: "cr cl", offset: { x: -20, y: 0 } }]}>{tooltip}</Bubble>
            )}
        </BubbleHoverTrigger>
    );
}
