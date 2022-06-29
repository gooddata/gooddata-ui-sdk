// (C) 2022 GoodData Corporation
import React from "react";
import { DropdownButton } from "@gooddata/sdk-ui-kit";
import { IAttributeFilterButtonProps } from "./types";

export const AttributeFilterSimpleButton: React.VFC<IAttributeFilterButtonProps> = (props) => {
    const { isOpen, title, onClick } = props;
    return <DropdownButton isOpen={isOpen} value={title} onClick={onClick} />;
};

export const AttributeFilterSimpleButtonWithSelection: React.VFC<IAttributeFilterButtonProps> = (props) => {
    const { isOpen, title, subtitleText, subtitleItemCount, onClick } = props;

    const titleWithSelection = `${title}: ${subtitleText} (${subtitleItemCount})`;

    return <DropdownButton isOpen={isOpen} value={titleWithSelection} onClick={onClick} />;
};
