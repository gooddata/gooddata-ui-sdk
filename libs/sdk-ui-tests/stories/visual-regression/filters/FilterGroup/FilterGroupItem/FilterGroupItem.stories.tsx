// (C) 2007-2025 GoodData Corporation

import { IntlWrapper } from "@gooddata/sdk-ui";
import { FilterGroupItem as FilterGroupItemComponent, UiBadge, UiIcon } from "@gooddata/sdk-ui-kit";

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

export function Default() {
    return (
        <IntlWrapper>
            <div style={wrapperStyle} className="screenshot-target">
                <FilterGroupItemComponent title="Filter Group Item" subtitle="Subtitle" />
                <FilterGroupItemComponent title="Filter Group Item" subtitle="Subtitle" isOpen />
                <FilterGroupItemComponent title="Filter Group Item" subtitle="Subtitle" isError />
                <FilterGroupItemComponent title="Filter Group Item" subtitle="Subtitle" isError isOpen />
                <FilterGroupItemComponent title="Filter Group Item" subtitle="Subtitle" isLoading />
                <FilterGroupItemComponent title="Filter Group Item" subtitle="Subtitle" isLoading isOpen />
                <FilterGroupItemComponent title="Filter Group Item" subtitle="Subtitle" isLoading isError />
                <FilterGroupItemComponent
                    title="Filter Group Item"
                    subtitle="Subtitle"
                    isLoaded
                    showSelectionCount
                    selectedItemsCount={12}
                />
                <FilterGroupItemComponent
                    title="Filter Group Item"
                    subtitle="Subtitle"
                    titleExtension={
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <UiIcon type="link" size={11} />
                            <UiBadge label="BMK" />
                        </span>
                    }
                />
                <FilterGroupItemComponent
                    title="Filter Group Item with a long long very long title which does not fit"
                    subtitle="This subtitle will be very very long so it does not fit in here"
                    titleExtension={
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <UiIcon type="link" size={11} />
                        </span>
                    }
                    isOpen
                    isError
                    isLoaded
                    showSelectionCount
                    selectedItemsCount={12}
                />
            </div>
        </IntlWrapper>
    );
}
Default.parameters = {
    kind: "default",
    screenshot: true,
};
