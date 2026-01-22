// (C) 2023-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { messages } from "@gooddata/sdk-ui";
import { Button, Separator } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import { selectCanManageAttributeHierarchy } from "../../../../../model/store/permissions/permissionsSelectors.js";

interface IAttributeHierarchyListFooterProps {
    onClick: () => void;
}

export function AttributeHierarchyListFooter({ onClick }: IAttributeHierarchyListFooterProps) {
    const { formatMessage } = useIntl();
    const canManageAttributeHierarchy = useDashboardSelector(selectCanManageAttributeHierarchy);

    const createHierarchyText = formatMessage(messages["hierarchyCreateButton"]);

    return canManageAttributeHierarchy ? (
        <div className="attribute-hierarchy-list-footer s-attribute-hierarchy-list-footer">
            <Separator />
            <Button
                className="gd-button-link-dimmed gd-icon-plus attribute-hierarchy-list-footer-button s-attribute-hierarchy-list-footer-button"
                value={createHierarchyText}
                onClick={onClick}
            />
        </div>
    ) : null;
}
