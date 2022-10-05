// (C) 2021-2022 GoodData Corporation
import React from "react";
import classNames from "classnames";
import { stringUtils } from "@gooddata/util";
import { IAttributeDisplayFormMetadataObject, ObjRef } from "@gooddata/sdk-model";
import { ShortenedText } from "@gooddata/sdk-ui-kit";

enum AttributeDisplayFormType {
    HYPERLINK = "GDC.link",
    GEO_PUSHPIN = "GDC.geo.pin",
}

const getDisplayFormIcon = (type: string) => {
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
    const { title } = displayForm;

    const className = classNames(
        "gd-list-item",
        "gd-attribute-display-form",
        "s-attribute-display-form-name",
        `s-attribute-display-form-name-${stringUtils.simplifyText(title)}`,
        getDisplayFormIcon(displayForm.type),
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
