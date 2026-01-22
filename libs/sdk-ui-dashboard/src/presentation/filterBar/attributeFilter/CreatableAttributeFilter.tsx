// (C) 2007-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { AddAttributeFilterPlaceholder } from "./addAttributeFilter/AddAttributeFilterPlaceholder.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectSupportsMultipleDateFilters } from "../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectHasCatalogAttributes,
    selectHasCatalogDateDatasets,
} from "../../../model/store/catalog/catalogSelectors.js";
import { selectIsWhiteLabeled } from "../../../model/store/config/configSelectors.js";
import { selectCanAddMoreFilters } from "../../../model/store/tabs/filterContext/filterContextSelectors.js";
import type { ICreatePanelItemComponentProps } from "../../componentDefinition/types.js";
import { DraggableAttributeFilterCreatePanelItem } from "../../dragAndDrop/draggableAttributeFilter/DraggableAttributeFilterCreatePanelItem.js";

/**
 * @internal
 */
export function CreatableAttributeFilter({
    WrapCreatePanelItemWithDragComponent,
}: ICreatePanelItemComponentProps) {
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
        <BubbleHoverTrigger eventsOnBubble className="s-add-attribute-filter-bubble-trigger">
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
