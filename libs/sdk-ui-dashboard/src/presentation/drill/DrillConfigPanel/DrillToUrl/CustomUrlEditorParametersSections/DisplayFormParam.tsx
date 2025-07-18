// (C) 2020-2025 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { AttributeDisplayFormParameterDetail } from "../ParameterDetails/AttributeDisplayFormParameterDetail.js";
import { Parameter } from "./Parameter.js";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { AttributeDisplayFormType, IAttributeDisplayFormMetadataObject } from "@gooddata/sdk-model";
import {
    selectAllCatalogAttributesMap,
    selectFilterContextAttributeFilterByDisplayForm,
    useDashboardSelector,
} from "../../../../../model/index.js";

interface XProps {
    item: IAttributeDisplayFormMetadataObject;
    onAdd: (placeholder: string) => void;
    iconClassName?: string;
    isFilter?: boolean;
}

export const DisplayFormParam: React.FC<XProps> = ({ item, onAdd, iconClassName, isFilter }) => {
    const x = useDashboardSelector(selectAllCatalogAttributesMap);
    const y = x.get(item.attribute);
    const intl = useIntl();
    const projectId = useWorkspaceStrict();
    const dashboardFilter = useDashboardSelector(selectFilterContextAttributeFilterByDisplayForm(item.ref));
    const defaultTitle = y?.attribute.title || "";

    return (
        <Parameter
            key={item.id}
            name={isFilter ? (dashboardFilter?.attributeFilter?.title ?? defaultTitle) : defaultTitle}
            description={item.title}
            detailContent={
                <AttributeDisplayFormParameterDetail
                    title={y?.attribute.title || ""}
                    label={item.title}
                    type={item.displayFormType as AttributeDisplayFormType}
                    projectId={projectId}
                    displayFormRef={item.ref}
                    showValues={true} // TODO
                />
            }
            iconClassName={
                iconClassName ?? getDisplayFormIcon(item.displayFormType as AttributeDisplayFormType)
            }
            onAdd={() => onAdd(`{attribute_title(${item.id})}`)}
            intl={intl}
        />
    );
};

const getDisplayFormIcon = (type: AttributeDisplayFormType | undefined) => {
    switch (type) {
        case "GDC.link":
            return "gd-icon-hyperlink-warning";
        case "GDC.image":
            return "gd-icon-image";
        case "GDC.geo.pin":
        case "GDC.geo.pin_latitude":
        case "GDC.geo.pin_longitude":
            return "gd-icon-earth";
        default:
            return "gd-icon-label-warning";
    }
};
