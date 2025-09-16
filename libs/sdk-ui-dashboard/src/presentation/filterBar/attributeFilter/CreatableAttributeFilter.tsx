// (C) 2007-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { AddAttributeFilterPlaceholder } from "./addAttributeFilter/index.js";
import {
    selectCanAddMoreFilters,
    selectHasCatalogAttributes,
    selectHasCatalogDateDatasets,
    selectIsWhiteLabeled,
    selectSupportsMultipleDateFilters,
    useDashboardSelector,
} from "../../../model/index.js";
import { ICreatePanelItemComponentProps } from "../../componentDefinition/index.js";
import { DraggableAttributeFilterCreatePanelItem } from "../../dragAndDrop/index.js";

/**
 * @internal
 */
export function CreatableAttributeFilter(props: ICreatePanelItemComponentProps) {
    const { WrapCreatePanelItemWithDragComponent } = props;
    const hasAttributes = useDashboardSelector(selectHasCatalogAttributes);
    const hasDateDataSets = useDashboardSelector(selectHasCatalogDateDatasets);
    const supportsMultipleDateFilters = useDashboardSelector(selectSupportsMultipleDateFilters);
    const canAddMoreFilters = useDashboardSelector(selectCanAddMoreFilters);
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);

    const noItems = supportsMultipleDateFilters ? !hasAttributes && !hasDateDataSets : !hasAttributes;

    const disabled = noItems || !canAddMoreFilters;

    const tooltip =
        disabled && noItems ? (
            <div>
                {supportsMultipleDateFilters ? (
                    <FormattedMessage id="addPanel.attributeFilter.tooltip.no_items" />
                ) : (
                    <FormattedMessage id="addPanel.attributeFilter.tooltip.no_attributes" />
                )}
                &nbsp;
                {isWhiteLabeled ? null : (
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
