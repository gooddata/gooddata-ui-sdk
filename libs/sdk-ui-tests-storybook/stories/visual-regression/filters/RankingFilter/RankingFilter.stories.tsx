// (C) 2007-2026 GoodData Corporation

import { action } from "storybook/actions";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { attributeLocalId, idRef, localIdRef, measureLocalId, newRankingFilter } from "@gooddata/sdk-model";
import {
    type IAttributeDropdownItem,
    type IMeasureDropdownItem,
    RankingFilter,
    RankingFilterDropdown,
} from "@gooddata/sdk-ui-filters";
import "@gooddata/sdk-ui-filters/styles/css/rankingFilter.css";

import { type INeobackstopConfig, type IStoryParameters, State } from "../../../_infra/backstopScenario.js";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

const dropdownScenarios: INeobackstopConfig = {
    default: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
};

const dropdownWithOneAttributeItemScenarios: INeobackstopConfig = {
    default: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    attributeDropdownButtonTooltip: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        hoverSelector: ".s-rf-attribute-dropdown-button",
        delay: { postOperation: 200 }, // element has .2s transition
    },
};

const customGranularityScenarios: INeobackstopConfig = {
    attributeDropdownOpened: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelector: ".s-rf-attribute-dropdown-button",
        delay: { postOperation: 200 }, // element has .2s transition
    },
};

const buttonScenarios: INeobackstopConfig = {
    closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    opened: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelector: ".s-rf-dropdown-button",
        delay: { postOperation: 200 }, // element has .2s transition
    },
};

const rankingFilter = newRankingFilter(ReferenceMd.Amount, "TOP", 10);
const nonStandardRankingFilter = newRankingFilter(ReferenceMd.Velocity.Sum, [ReferenceMd.Status], "TOP", 42);

const measureDropdownItems: IMeasureDropdownItem[] = [
    {
        title: "Sum of amount",
        ref: localIdRef(measureLocalId(ReferenceMd.Amount)),
        sequenceNumber: "M1",
    },
    {
        title: "Sum of velocity with very long name",
        ref: localIdRef(measureLocalId(ReferenceMd.Velocity.Sum)),
        sequenceNumber: "M2",
    },
];

const attributeDropdownItems: IAttributeDropdownItem[] = [
    {
        title: "Account",
        ref: localIdRef(attributeLocalId(ReferenceMd.Account.Name)),
        type: "ATTRIBUTE",
    },
    {
        title: "Status attribute with very long name",
        ref: localIdRef(attributeLocalId(ReferenceMd.Status)),
        type: "ATTRIBUTE",
    },
    {
        title: "Date",
        ref: localIdRef(attributeLocalId(ReferenceMd.DateDatasets.Closed.ClosedDate.Default)),
        type: "DATE",
    },
];

// Mock "out of" dimensionality items for the multi-attribute (improved) ranking filter section.
const outOfInsightAttributes = [
    {
        identifier: localIdRef(attributeLocalId(ReferenceMd.Account.Name)),
        title: "Account",
        type: "attribute" as const,
    },
];
const outOfCatalogAttributes = [
    {
        identifier: idRef("department.df", "displayForm"),
        ref: idRef("department.df", "displayForm"),
        title: "Department (catalog)",
        type: "attribute" as const,
    },
    {
        identifier: idRef("region.df", "displayForm"),
        ref: idRef("region.df", "displayForm"),
        title: "Region (catalog)",
        type: "attribute" as const,
    },
];
// Current selection: the insight default plus a catalog attribute, so the chips and the reset control show.
const outOfSelectedAttributes = [...outOfInsightAttributes, outOfCatalogAttributes[0]];

const outOfAttributesSectionScenarios: INeobackstopConfig = {
    default: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    attributePickerOpened: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelector: '[data-testid="rf-attributes-plus"]',
        delay: { postOperation: 200 }, // element has .2s transition
    },
};

export default {
    title: "10 Filters/RankingFilter",
};

export function Dropdown() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <span className="dropdown-anchor-test" />
            <RankingFilterDropdown
                measureItems={measureDropdownItems}
                attributeItems={attributeDropdownItems}
                filter={rankingFilter}
                onApply={action("apply")}
                onCancel={action("cancel")}
                anchorEl=".dropdown-anchor-test"
            />
        </div>
    );
}
Dropdown.parameters = { kind: "dropdown", screenshots: dropdownScenarios } satisfies IStoryParameters;

export function DropdownWithOneAttributeItem() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <span className="dropdown-anchor-test" />
            <RankingFilterDropdown
                measureItems={measureDropdownItems}
                attributeItems={[attributeDropdownItems[0]]}
                filter={rankingFilter}
                onApply={action("apply")}
                onCancel={action("cancel")}
                anchorEl=".dropdown-anchor-test"
            />
        </div>
    );
}
DropdownWithOneAttributeItem.parameters = {
    kind: "dropdown with one attribute item",
    screenshots: dropdownWithOneAttributeItemScenarios,
} satisfies IStoryParameters;

export function DropdownWithNonDefaultValueAndLongItemsSelected() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <span className="dropdown-anchor-test" />
            <RankingFilterDropdown
                measureItems={measureDropdownItems}
                attributeItems={attributeDropdownItems}
                filter={nonStandardRankingFilter}
                onApply={action("apply")}
                onCancel={action("cancel")}
                anchorEl=".dropdown-anchor-test"
            />
        </div>
    );
}
DropdownWithNonDefaultValueAndLongItemsSelected.parameters = {
    kind: "dropdown with non default value and long items selected",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function DropdownWithCustomGranularitySelectionDisabled() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <span className="dropdown-anchor-test" />
            <RankingFilterDropdown
                measureItems={measureDropdownItems}
                attributeItems={attributeDropdownItems}
                filter={rankingFilter}
                onApply={action("apply")}
                onCancel={action("cancel")}
                anchorEl=".dropdown-anchor-test"
                customGranularitySelection={{
                    enable: false,
                    warningMessage: "This item is disabled.",
                }}
            />
        </div>
    );
}
DropdownWithCustomGranularitySelectionDisabled.parameters = {
    kind: "dropdown with custom granularity selection disabled",
    screenshots: customGranularityScenarios,
} satisfies IStoryParameters;

const strictLimitDropdownScenarios: INeobackstopConfig = {
    default: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    conditionDropdownOpened: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelector: ".s-rf-operator-dropdown-button",
        delay: { postOperation: 200 }, // element has .2s transition
    },
};

export function DropdownWithStrictLimitEnabled() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <span className="dropdown-anchor-test" />
            <RankingFilterDropdown
                measureItems={measureDropdownItems}
                attributeItems={attributeDropdownItems}
                filter={rankingFilter}
                onApply={action("apply")}
                onCancel={action("cancel")}
                anchorEl=".dropdown-anchor-test"
                enableRankingStrictLimit
            />
        </div>
    );
}
DropdownWithStrictLimitEnabled.parameters = {
    kind: "dropdown with strict limit enabled",
    screenshots: strictLimitDropdownScenarios,
} satisfies IStoryParameters;

export function DropdownWithOutOfAttributesSection() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <span className="dropdown-anchor-test" />
            <RankingFilterDropdown
                measureItems={measureDropdownItems}
                attributeItems={attributeDropdownItems}
                filter={rankingFilter}
                onApply={action("apply")}
                onCancel={action("cancel")}
                anchorEl=".dropdown-anchor-test"
                isAttributesSectionEnabled
                attributes={outOfSelectedAttributes}
                insightAttributes={outOfInsightAttributes}
                catalogAttributes={outOfCatalogAttributes}
            />
        </div>
    );
}
DropdownWithOutOfAttributesSection.parameters = {
    kind: "dropdown with out of attributes section",
    screenshots: outOfAttributesSectionScenarios,
} satisfies IStoryParameters;

export function DefaultButtonWithDropdown() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <RankingFilter
                measureItems={measureDropdownItems}
                attributeItems={attributeDropdownItems}
                filter={rankingFilter}
                onApply={action("apply")}
                onCancel={action("cancel")}
                buttonTitle="Ranking Filter"
            />
        </div>
    );
}
DefaultButtonWithDropdown.parameters = {
    kind: "default button with dropdown",
    screenshots: buttonScenarios,
} satisfies IStoryParameters;
