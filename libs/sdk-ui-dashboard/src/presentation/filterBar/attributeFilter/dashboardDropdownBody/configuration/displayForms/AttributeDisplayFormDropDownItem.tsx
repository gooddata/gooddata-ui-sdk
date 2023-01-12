// (C) 2022-2023 GoodData Corporation
import { IAttributeDisplayFormMetadataObject, ObjRef, AttributeDisplayFormType } from "@gooddata/sdk-model";
import React from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import { ShortenedText } from "@gooddata/sdk-ui-kit";

const getDisplayFormIcon = (type?: AttributeDisplayFormType) => {
    switch (type) {
        case AttributeDisplayFormType.HYPERLINK:
            return "gd-icon-hyperlink-warning";
        case AttributeDisplayFormType.GEO_PUSHPIN:
            return "gd-icon-earth";
        default:
            return "gd-icon-label-warning";
    }
};

const tooltipAlignPoints = [
    { align: "cl cr", offset: { x: -10, y: 0 } },
    { align: "cr cl", offset: { x: 10, y: 0 } },
];

export interface IAttributeDisplayFormDropDownItemProps {
    displayForm: IAttributeDisplayFormMetadataObject;
    onClick: (displayForm: ObjRef) => void;
    selected: boolean;
}

export const AttributeDisplayFormDropDownItem: React.FC<IAttributeDisplayFormDropDownItemProps> = ({
    displayForm,
    onClick,
    selected,
}) => {
    const { title } = displayForm;

    const className = cx(
        "gd-list-item",
        "attribute-display-form-name",
        "s-attribute-display-form-name",
        `s-attribute-display-form-name-${stringUtils.simplifyText(title)}`,
        getDisplayFormIcon(displayForm.displayFormType as AttributeDisplayFormType),
        {
            "is-selected": selected,
        },
    );

    const handleOnClick = () => {
        onClick(displayForm.ref);
    };

    return (
        <div className={className} onClick={handleOnClick}>
            <ShortenedText tooltipAlignPoints={tooltipAlignPoints}>{title}</ShortenedText>
        </div>
    );
};
