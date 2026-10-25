// (C) 2023-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import {
    type ICatalogAttributeHierarchy,
    type ICatalogDateAttributeHierarchy,
    isCatalogAttributeHierarchy,
} from "@gooddata/sdk-model";
import { AttributeHierarchyDetailPanel, type IAttributeHierarchyDetailItem } from "@gooddata/sdk-ui-ext";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { showAttributeHierarchyEditDialog } from "../../../actions/dialogs_actions.js";
import { canManageProject } from "../../../selectors/permissions_selector.js";
import { DateDatasetsMetaService } from "../../../services/date_datasets_meta_service.js";
import { getCatalogItems } from "../../../store/catalog/catalog_selector.js";
import { type AppDispatch } from "../../../store/types.js";

import { extractDescription, extractTitle, mapAttributeItems } from "./utils.js";

const BUBBLE_ALIGN_POINTS = [
    { align: "cr cl", offset: { x: -5, y: 0 } },
    { align: "cr bl", offset: { x: -5, y: 0 } },
    { align: "cr tl", offset: { x: -5, y: 0 } },
];

const ARROW_STYLE = { display: "none" };

export interface IAttributeHierarchyIconWithTooltipProps {
    attributeHierarchy: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy;
}

export function AttributeHierarchyIconWithTooltip({
    attributeHierarchy,
}: IAttributeHierarchyIconWithTooltipProps) {
    const intl = useIntl();

    const catalogItems = useSelector(getCatalogItems);
    const dateAttributes = useSelector(DateDatasetsMetaService.getDateAttributes);
    const userCanManageProject = useSelector(canManageProject);

    const dispatch = useDispatch<AppDispatch>();
    const handleShowAttributeHierarchyEditDialog = useCallback(
        (attributeHierarchy: ICatalogAttributeHierarchy) => {
            dispatch(showAttributeHierarchyEditDialog(attributeHierarchy));
        },
        [dispatch],
    );

    const mappedAttributes: IAttributeHierarchyDetailItem[] = useMemo(
        () => mapAttributeItems(attributeHierarchy, catalogItems, dateAttributes),
        [attributeHierarchy, catalogItems, dateAttributes],
    );

    const onEdit =
        userCanManageProject && isCatalogAttributeHierarchy(attributeHierarchy)
            ? () => {
                  handleShowAttributeHierarchyEditDialog(attributeHierarchy);
              }
            : undefined;

    return (
        <span>
            <BubbleHoverTrigger showDelay={0} hideDelay={100} eventsOnBubble>
                <i className="inlineBubbleHelp" />
                <Bubble
                    className="bubble-light adi-catalog-item-details attribute-hierarchy-bubble-detail s-attribute-hierarchy-detail-bubble-content"
                    alignPoints={BUBBLE_ALIGN_POINTS}
                    arrowStyle={ARROW_STYLE}
                >
                    <InternalIntlWrapper locale={intl.locale}>
                        <AttributeHierarchyDetailPanel
                            title={extractTitle(attributeHierarchy)}
                            description={extractDescription(attributeHierarchy)}
                            attributes={mappedAttributes}
                            onEdit={onEdit}
                        />
                    </InternalIntlWrapper>
                </Bubble>
            </BubbleHoverTrigger>
        </span>
    );
}
