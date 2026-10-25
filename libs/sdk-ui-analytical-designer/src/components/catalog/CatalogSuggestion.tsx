// (C) 2019-2026 GoodData Corporation

import classNames from "classnames";

import { UiIcon, UiSkeleton } from "@gooddata/sdk-ui-kit";

import { getCssClass } from "../../utils/css_class.js";

export interface ICatalogSuggestionsProps {
    name: string;
    isLoading: boolean;
}

export function CatalogSuggestions({ name, isLoading }: ICatalogSuggestionsProps) {
    const wrapperClasses = classNames(
        "adi-catalog-group",
        "s-catalog-group",
        getCssClass(name, "s-catalog-group-"),
    );
    const labelClasses = classNames("adi-catalog-suggestion-label", "s-catalog-group-label");

    return (
        <>
            <div className="adi-catalog-tab-suggestion-separator">
                <hr />
            </div>
            <div className={wrapperClasses}>
                <div className={labelClasses} title={name}>
                    <UiIcon type="aiFill" size={12} />
                    <span>{name}</span>
                </div>
                {isLoading ? (
                    <div className="adi-catalog-suggestion-loading">
                        <UiSkeleton itemsCount={1} itemsGap={2} itemHeight={20} itemBorderRadius={3} />
                    </div>
                ) : null}
            </div>
        </>
    );
}
