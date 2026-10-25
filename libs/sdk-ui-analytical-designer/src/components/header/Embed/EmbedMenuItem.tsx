// (C) 2007-2026 GoodData Corporation

import { useCallback } from "react";

import cx from "classnames";

import { Bubble, BubbleHoverTrigger, Item } from "@gooddata/sdk-ui-kit";

const ALIGN_POINTS_DISABLE = [{ align: "cl cr" }];

interface IEmbedMenuItemProps {
    title: string;
    disabled?: boolean;
    disableMessage?: string;
    onMenuItemClick: () => void;
}

export function EmbedMenuItem({ disabled, title, disableMessage, onMenuItemClick }: IEmbedMenuItemProps) {
    const menuIdClass = `s-embed-menu-item`;

    const onClick = useCallback(() => {
        if (!disabled) {
            onMenuItemClick();
        }
    }, [disabled, onMenuItemClick]);

    return (
        <Item onClick={onClick} disabled={disabled} className={cx("adi-embed-button-menu-item", menuIdClass)}>
            <div className="adi-embed-button-menu-item-bubble">
                <BubbleHoverTrigger tagName={"div"} showDelay={100}>
                    <div> {title} </div>
                    {disabled ? (
                        <Bubble alignTo={menuIdClass} alignPoints={ALIGN_POINTS_DISABLE}>
                            {disableMessage}
                        </Bubble>
                    ) : null}
                </BubbleHoverTrigger>
            </div>
        </Item>
    );
}
