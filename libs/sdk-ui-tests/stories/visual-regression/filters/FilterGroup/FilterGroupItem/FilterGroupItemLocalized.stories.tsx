// (C) 2007-2025 GoodData Corporation

import { IntlProvider } from "react-intl";

import { FilterGroupItem as FilterGroupItemComponent } from "@gooddata/sdk-ui-kit";

const wrapperStyle = {
    width: 250,
    height: 800,
    padding: "1em 1em",
    display: "flex" as const,
    flexDirection: "column",
    gap: 10,
} as const;

// eslint-disable-next-line no-restricted-exports
export default {
    title: "10 Filters/FilterGroup/FilterGroupItem",
};

export function Localized() {
    return (
        <IntlProvider
            locale="en-US"
            messages={{
                loading: "Laden...",
            }}
        >
            <div style={wrapperStyle} className="screenshot-target">
                <FilterGroupItemComponent title="Filter Group Item" subtitle="Subtitle" />
                <FilterGroupItemComponent title="Filter Group Item" subtitle="Subtitle" isLoading />
                <FilterGroupItemComponent title="Filter Group Item" subtitle="Subtitle" isLoading isOpen />
                <FilterGroupItemComponent title="Filter Group Item" subtitle="Subtitle" isLoading isError />
                <FilterGroupItemComponent subtitle="Subtitle" isLoading />
            </div>
        </IntlProvider>
    );
}
Localized.parameters = {
    kind: "localized",
    screenshot: true,
};
