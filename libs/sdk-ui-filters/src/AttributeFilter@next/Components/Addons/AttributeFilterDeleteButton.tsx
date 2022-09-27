// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";

const ALIGN_POINTS = [{ align: "bc tc", offset: { x: -1, y: 5 } }];

/**
 * @internal
 */
export interface IAttributeFilterDeleteButtonProps {
    onDelete: () => void;
}

/**
 * @internal
 */
export const AttributeFilterDeleteButton: React.VFC<IAttributeFilterDeleteButtonProps> = (props) => {
    const { onDelete } = props;

    return (
        <div className="gd-attribute-filter-delete-button">
            <BubbleHoverTrigger>
                <Button
                    className="gd-button-link gd-button-icon-only gd-button-small gd-icon-trash gd-delete-button s-delete-button"
                    disabled={false}
                    onClick={onDelete}
                />
                <Bubble className={`bubble-primary`} alignPoints={ALIGN_POINTS}>
                    <FormattedMessage id="attributesDropdown.removeTooltip" />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
