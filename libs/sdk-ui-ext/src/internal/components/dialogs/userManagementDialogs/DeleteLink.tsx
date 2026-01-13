// (C) 2023-2025 GoodData Corporation

import { Button, type IAlignPoint, withBubble } from "@gooddata/sdk-ui-kit";

const alignPoints: IAlignPoint[] = [{ align: "bc tc" }];

export interface IDeleteLinkProps {
    isDeleteLinkEnabled: boolean;
    deleteLinkText: string;
    disabledLinkTooltipTextId?: string;
    onOpenDeleteDialog: () => void;
}

function Link({ deleteLinkText, onOpenDeleteDialog, isDeleteLinkEnabled }: IDeleteLinkProps) {
    return isDeleteLinkEnabled ? (
        <Button
            className="gd-button gd-button-link-dimmed gd-user-management-dialog-button-underlined s-user-management-delete-link"
            value={deleteLinkText}
            onClick={onOpenDeleteDialog}
        />
    ) : (
        <span className="gd-button-link-dimmed-disabled">{deleteLinkText}</span>
    );
}

const DisabledLinKWithBubble = withBubble(Link);

export function DeleteLink(props: IDeleteLinkProps) {
    const { isDeleteLinkEnabled, disabledLinkTooltipTextId } = props;
    return (
        <div>
            {isDeleteLinkEnabled ? (
                <Link {...props} />
            ) : (
                <DisabledLinKWithBubble
                    {...props}
                    showBubble
                    bubbleTextId={disabledLinkTooltipTextId}
                    alignPoints={alignPoints}
                />
            )}
        </div>
    );
}
