// (C) 2007-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { type IOrganizedCatalogTooltipDetailsFact } from "../../typings/catalog.js";

export function FactBubbleContent(props: IOrganizedCatalogTooltipDetailsFact) {
    return (
        <span>
            <h4>
                <FormattedMessage id="dashboard.catalog_item.dataset" />
            </h4>
            <p>
                {props.dataset ? (
                    <span className="s-dataset-name">{props.dataset.title}</span>
                ) : (
                    <FormattedMessage id="loading" />
                )}
            </p>
        </span>
    );
}
