// (C) 2026 GoodData Corporation

import { useSelector } from "react-redux";

import { isAllowedDashboardLinks } from "../../selectors/route_selector.js";
import { documentUriFactorySelector } from "../../selectors/uri_selector.js";
import { type IInsightUsageInDocumentItem } from "../../store/insight_usage/insight_usage_state.js";

export interface IDocumentItemProps {
    item: IInsightUsageInDocumentItem;
}

export function DocumentItem({ item }: IDocumentItemProps) {
    const isLinkable = useSelector(isAllowedDashboardLinks);
    const documentUriFactory = useSelector(documentUriFactorySelector);

    const { id, title } = item;
    return (
        <li className="s-insight-usage-document-item">
            {isLinkable ? (
                <a
                    className="dashboard-item"
                    href={documentUriFactory(id)}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <span>{title}</span>
                </a>
            ) : (
                <span>{title}</span>
            )}
        </li>
    );
}
