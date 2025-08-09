// (C) 2025 GoodData Corporation

import { Item, Separator, ItemsWrapper } from "@gooddata/sdk-ui-kit";
import { messages } from "../messages.js";
import { useIntl } from "react-intl";
import React from "react";

export const AutomationMenu = ({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) => {
    const intl = useIntl();

    return (
        <ItemsWrapper smallItemsSpacing>
            <Item onClick={onEdit}>{intl.formatMessage(messages.menuEdit)}</Item>
            <Separator />
            <Item onClick={onDelete}>{intl.formatMessage(messages.menuDelete)}</Item>
        </ItemsWrapper>
    );
};
