// (C) 2021-2026 GoodData Corporation

import { type MouseEvent } from "react";

import classNames from "classnames";

import {
    type AttributeDisplayFormType,
    type IAttributeDisplayFormMetadataObject,
    type ObjRef,
} from "@gooddata/sdk-model";
import { ShortenedText } from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

const getDisplayFormIcon = (type?: AttributeDisplayFormType) => {
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

export interface IDisplayFormDropdownItemProps {
    displayForm: IAttributeDisplayFormMetadataObject;
    onClick: (displayForm: ObjRef) => void;
    selected: boolean;
}

export function DisplayDropdownItem({ displayForm, selected, onClick }: IDisplayFormDropdownItemProps) {
    const { title } = displayForm;

    const className = classNames(
        "gd-list-item",
        "attribute-display-form-name",
        "s-attribute-display-form-name",
        `s-attribute-display-form-name-${simplifyText(title)}`,
        getDisplayFormIcon(displayForm.displayFormType as AttributeDisplayFormType),
        {
            "is-selected": selected,
        },
    );

    const handleOnClick = (e: MouseEvent<HTMLDivElement>) => {
        onClick(displayForm.ref);
        e.preventDefault();
    };

    return (
        <div className={className} onClick={handleOnClick}>
            <ShortenedText tooltipAlignPoints={tooltipAlignPoints}>{title}</ShortenedText>
        </div>
    );
}
