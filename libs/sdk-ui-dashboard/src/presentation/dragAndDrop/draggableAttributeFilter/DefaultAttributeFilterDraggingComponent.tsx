// (C) 2007-2022 GoodData Corporation
import React from "react";
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
import { selectCatalogAttributeDisplayForms, useDashboardSelector } from "../../../model";
import { AttributeFilterDraggingComponent } from "../../componentDefinition";

function isDisplayFormEqual(displayForm: IAttributeDisplayFormMetadataObject, identifierOrUriRef: ObjRef) {
    return (
        areObjRefsEqual(idRef(displayForm.id, displayForm.type), identifierOrUriRef) ||
        areObjRefsEqual(uriRef(displayForm.uri), identifierOrUriRef)
    );
}

const selectFilterDisplayForm = (filter: IDashboardAttributeFilter) =>
    createSelector(selectCatalogAttributeDisplayForms, (displayFroms) =>
        displayFroms.find((displayForm) =>
            isDisplayFormEqual(displayForm, filter.attributeFilter.displayForm),
        ),
    );

export const DefaultAttributeFilterDraggingComponent: AttributeFilterDraggingComponent = ({ item }) => {
    const theme = useTheme();
    const filterDisplayForm = useDashboardSelector(selectFilterDisplayForm(item.filter));
    if (!filterDisplayForm) {
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
                    <ShortenedText>{filterDisplayForm.title}</ShortenedText>
                </div>
            </div>
        </div>
    );
};
