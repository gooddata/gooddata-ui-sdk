// (C) 2007-2025 GoodData Corporation

import React from "react";

import { createSelector } from "@reduxjs/toolkit";

import {
    IAttributeDisplayFormMetadataObject,
    IDashboardAttributeFilter,
    ObjRef,
    areObjRefsEqual,
    idRef,
    uriRef,
} from "@gooddata/sdk-model";
import { Icon, ShortenedText } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { selectCatalogAttributes, useDashboardSelector } from "../../../model/index.js";
import { IAttributeFilterDraggingComponentProps } from "../../componentDefinition/index.js";

const { DragHandle: DragHandleIcon } = Icon;

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
            <DragHandleIcon
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
