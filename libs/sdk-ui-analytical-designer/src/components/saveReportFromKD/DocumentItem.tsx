// (C) 2026 GoodData Corporation

import { useSelector } from "react-redux";

import { isAllowedDashboardLinks } from "../../selectors/route_selector.js";
import { documentUriFactorySelector } from "../../selectors/uri_selector.js";
import { type IInsightUsageInDocumentItem } from "../../store/insight_usage/insight_usage_state.js";

export interface IDocumentItemProps {
    item: IInsightUsageInDocumentItem;
}

export function DocumentItem({ item }: IDocumentItemProps) {
    const isLinkAllowed = useSelector(isAllowedDashboardLinks);
    const documentUriFactory = useSelector(documentUriFactorySelector);

    const href = isLinkAllowed ? documentUriFactory(item) : undefined;
    return (
        <li className="s-insight-usage-document-item">
            {href ? (
                <a className="dashboard-item" href={href} rel="noopener noreferrer" target="_blank">
                    <span>{item.title}</span>
                </a>
            ) : (
                <span>{item.title}</span>
            )}
        </li>
    );
}
