// (C) 2021-2024 GoodData Corporation
import React from "react";
import classNames from "classnames";
import { stringUtils } from "@gooddata/util";
import { IAttributeDisplayFormMetadataObject, ObjRef, AttributeDisplayFormType } from "@gooddata/sdk-model";
import { ShortenedText } from "@gooddata/sdk-ui-kit";

const getDisplayFormIcon = (type: AttributeDisplayFormType) => {
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

const tooltipAlignPoints = [
    { align: "cl cr", offset: { x: -10, y: 0 } },
    { align: "cr cl", offset: { x: 10, y: 0 } },
];

/**
 * @internal
 */
export interface IAttributeDisplayFormSelectItemProps {
    displayForm: IAttributeDisplayFormMetadataObject;
    onClick: (displayForm: ObjRef) => void;
    selected: boolean;
}

/**
 * @internal
 */
export const AttributeDisplayFormSelectItem: React.FC<IAttributeDisplayFormSelectItemProps> = (props) => {
    const { displayForm, selected } = props;
    const { title, type } = displayForm;

    const className = classNames(
        "gd-list-item",
        "gd-attribute-display-form",
        "s-attribute-display-form-name",
        `s-attribute-display-form-name-${stringUtils.simplifyText(title)}`,
        getDisplayFormIcon(type as AttributeDisplayFormType),
        {
            "is-selected": selected,
        },
    );

    const handleOnClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const { displayForm, onClick } = props;

        onClick(displayForm.ref);
        e.preventDefault();
    };

    return (
        <div className={className} onClick={handleOnClick}>
            <ShortenedText className="gd-attribute-display-form-name" tooltipAlignPoints={tooltipAlignPoints}>
                {title}
            </ShortenedText>
        </div>
    );
};
