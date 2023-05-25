// (C) 2007-2022 GoodData Corporation
import React from "react";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";
import { DraggableAttributeFilterCreatePanelItem } from "../../dragAndDrop/index.js";
import { AddAttributeFilterPlaceholder } from "./addAttributeFilter/index.js";
import {
    useDashboardSelector,
    selectHasCatalogAttributes,
    selectIsWhiteLabeled,
    selectCanAddMoreAttributeFilters,
} from "../../../model/index.js";
import { ICreatePanelItemComponentProps } from "../../componentDefinition/index.js";

/**
 * @internal
 */
export function CreatableAttributeFilter(props: ICreatePanelItemComponentProps) {
    const { WrapCreatePanelItemWithDragComponent } = props;
    const hasAttributes = useDashboardSelector(selectHasCatalogAttributes);
    const canAddMoreAttributeFilters = useDashboardSelector(selectCanAddMoreAttributeFilters);
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);

    const disabled = !hasAttributes || !canAddMoreAttributeFilters;

    const tooltip =
        disabled && !hasAttributes ? (
            <div>
                <FormattedMessage id="addPanel.attributeFilter.tooltip.no_attributes" />
                &nbsp;
                {!isWhiteLabeled ? (
                    <a
                        href="https://help.gooddata.com/display/doc/Attributes+in+Logical+Data+Models"
                        rel="noopener noreferrer"
                        target="_blank"
                        className="s-add-attribute-filter-tooltip-link"
                    >
                        <FormattedMessage id="addPanel.attributeFilter.tooltip.no_attributes.link" />
                    </a>
                ) : null}
            </div>
        ) : undefined;

    return (
        <BubbleHoverTrigger eventsOnBubble={true} className="s-add-attribute-filter-bubble-trigger">
            <DraggableAttributeFilterCreatePanelItem
                CreatePanelItemComponent={AddAttributeFilterPlaceholder}
                WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
                disabled={disabled}
            />

            {tooltip ? (
                <Bubble alignPoints={[{ align: "cr cl", offset: { x: -20, y: 0 } }]}>{tooltip}</Bubble>
            ) : null}
        </BubbleHoverTrigger>
    );
}
