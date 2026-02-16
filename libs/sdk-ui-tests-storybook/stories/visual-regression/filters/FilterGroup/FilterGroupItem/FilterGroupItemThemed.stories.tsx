// (C) 2007-2026 GoodData Corporation

import { IntlWrapper } from "@gooddata/sdk-ui";
import { FilterGroupItem as FilterGroupItemComponent, UiBadge, UiIcon } from "@gooddata/sdk-ui-kit";

import { State } from "../../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

const wrapperStyle = {
    width: 250,
    height: 800,
    padding: "1em 1em",
    display: "flex" as const,
    flexDirection: "column",
    gap: 10,
} as const;

export default {
    title: "10 Filters/FilterGroup/FilterGroupItem",
};

export function Themed() {
    return wrapWithTheme(
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
                    titleExtension={
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <UiIcon type="link" size={11} />
                            <UiBadge label="BMK" />
                        </span>
                    }
                />
            </div>
        </IntlWrapper>,
    );
}
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
};
