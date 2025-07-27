// (C) 2007-2025 GoodData Corporation
import { Icon, ShortenedText } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import {
    areObjRefsEqual,
    IAttributeDisplayFormMetadataObject,
    IDashboardAttributeFilter,
    idRef,
    ObjRef,
    uriRef,
} from "@gooddata/sdk-model";
import { createSelector } from "@reduxjs/toolkit";
import { selectCatalogAttributes, useDashboardSelector } from "../../../model/index.js";
import { IAttributeFilterDraggingComponentProps } from "../../componentDefinition/index.js";

function isDisplayFormEqual(displayForm: IAttributeDisplayFormMetadataObject, identifierOrUriRef: ObjRef) {
    return (
        areObjRefsEqual(idRef(displayForm.id, displayForm.type), identifierOrUriRef) ||
        areObjRefsEqual(uriRef(displayForm.uri), identifierOrUriRef)
    );
}

const selectFilterAttribute = (filter: IDashboardAttributeFilter) =>
    createSelector(selectCatalogAttributes, (attributes) =>
        attributes.find((attribute) =>
            attribute.displayForms.some((displayForm) =>
                isDisplayFormEqual(displayForm, filter.attributeFilter.displayForm),
            ),
        ),
    );

export function DefaultAttributeFilterDraggingComponent({ item }: IAttributeFilterDraggingComponentProps) {
    const theme = useTheme();
    const filterAttribute = useDashboardSelector(selectFilterAttribute(item.filter));
    if (!filterAttribute) {
        return null;
    }

    return (
        <div className="attribute-filter-button is-dragging">
            <Icon.DragHandle
                width={7}
                height={26}
                className="drag-handle-icon"
                color={theme?.palette?.complementary?.c5}
            />
            <div className="button-content">
                <div className="button-title">
                    <ShortenedText>{filterAttribute.attribute.title}</ShortenedText>
                </div>
            </div>
        </div>
    );
}
