// (C) 2021 GoodData Corporation
import React from "react";
import { Bubble, BubbleHoverTrigger, Button, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { FormattedHTMLMessage } from "react-intl";

interface IDeleteButton {
    deleteFilter: () => void;
}

const bubbleAlignPoints: IAlignPoint[] = [{ align: "bc tc", offset: { x: -1, y: 5 } }];

export const DeleteButton: React.FC<IDeleteButton> = ({ deleteFilter }) => {
    return (
        <div className="delete-button-wrapper">
            <BubbleHoverTrigger>
                <Button
                    key="delete-button"
                    className="gd-button-link gd-button-icon-only gd-icon-trash delete-button s-delete-button"
                    disabled={false}
                    onClick={deleteFilter}
                />
                <Bubble className="bubble-primary" alignPoints={bubbleAlignPoints}>
                    <FormattedHTMLMessage id="attributesDropdown.removeTooltip" />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
