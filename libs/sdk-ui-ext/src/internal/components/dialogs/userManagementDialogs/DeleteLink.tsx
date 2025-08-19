// (C) 2023-2025 GoodData Corporation

import React from "react";

import { Button, IAlignPoint, withBubble } from "@gooddata/sdk-ui-kit";

const alignPoints: IAlignPoint[] = [{ align: "bc tc" }];

export interface IDeleteLinkProps {
    isDeleteLinkEnabled: boolean;
    deleteLinkText: string;
    disabledLinkTooltipTextId: string;
    onOpenDeleteDialog: () => void;
}

const Link: React.FC<IDeleteLinkProps> = ({ deleteLinkText, onOpenDeleteDialog, isDeleteLinkEnabled }) => {
    return isDeleteLinkEnabled ? (
        <Button
            className="gd-button gd-button-link-dimmed gd-user-management-dialog-button-underlined s-user-management-delete-link"
            value={deleteLinkText}
            onClick={onOpenDeleteDialog}
        />
    ) : (
        <span className="gd-button-link-dimmed-disabled">{deleteLinkText}</span>
    );
};

const DisabledLinKWithBubble = withBubble(Link);

export const DeleteLink: React.FC<IDeleteLinkProps> = (props) => {
    const { isDeleteLinkEnabled, disabledLinkTooltipTextId } = props;
    return (
        <div>
            {isDeleteLinkEnabled ? (
                <Link {...props} />
            ) : (
                <DisabledLinKWithBubble
                    {...props}
                    showBubble={true}
                    bubbleTextId={disabledLinkTooltipTextId}
                    alignPoints={alignPoints}
                />
            )}
        </div>
    );
};
