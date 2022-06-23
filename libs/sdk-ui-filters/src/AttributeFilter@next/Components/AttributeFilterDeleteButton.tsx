// (C) 2022 GoodData Corporation
import React from "react";
// import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";

const ALIGN_POINTS = [{ align: "bc tc", offset: { x: -1, y: 5 } }];

export interface IAttributeFilterDeleteButtonProps {
    onDelete: () => void;
}
//TODO this component is prepared for Dashboard edit mode customization and maybe should be moved to Dashboard
export const AttributeFilterDeleteButton: React.VFC<IAttributeFilterDeleteButtonProps> = (props) => {
    const { onDelete } = props;

    return (
        <div className="gd-attribute-filter-delete-button">
            <BubbleHoverTrigger>
                <Button
                    key="delete-button"
                    className="gd-button-link gd-button-icon-only gd-icon-trash delete-button s-delete-button"
                    disabled={false}
                    onClick={onDelete}
                />
                <Bubble className={`bubble-primary`} alignPoints={ALIGN_POINTS}>
                    Tooltip
                    {/*
                        I do not want to add this localization, not sure where this comp will exist  
                        <FormattedMessage id="attributesDropdown.removeTooltip" /> 
                    */}
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
