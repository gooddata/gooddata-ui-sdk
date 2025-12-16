// (C) 2007-2025 GoodData Corporation

import { action } from "storybook/actions";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { attributeLocalId, localIdRef, measureLocalId, newRankingFilter } from "@gooddata/sdk-model";
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
        postInteractionWait: { delay: 200 },
    },
};

const customGranularityScenarios: INeobackstopConfig = {
    attributeDropdownOpened: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelector: ".s-rf-attribute-dropdown-button",
        delay: { postOperation: 350 },
    },
};

const buttonScenarios: INeobackstopConfig = {
    closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    opened: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelector: ".s-rf-dropdown-button",
        postInteractionWait: { delay: 200 },
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

// eslint-disable-next-line no-restricted-exports
export default {
    title: "10 Filters/RankingFilter",
};

export function Dropdown() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <RankingFilterDropdown
                measureItems={measureDropdownItems}
                attributeItems={attributeDropdownItems}
                filter={rankingFilter}
                onApply={action("apply")}
                onCancel={action("cancel")}
                anchorEl="screenshot-target"
            />
        </div>
    );
}
Dropdown.parameters = { kind: "dropdown", screenshots: dropdownScenarios } satisfies IStoryParameters;

export function DropdownWithOneAttributeItem() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <RankingFilterDropdown
                measureItems={measureDropdownItems}
                attributeItems={[attributeDropdownItems[0]]}
                filter={rankingFilter}
                onApply={action("apply")}
                onCancel={action("cancel")}
                anchorEl="screenshot-target"
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
            <RankingFilterDropdown
                measureItems={measureDropdownItems}
                attributeItems={attributeDropdownItems}
                filter={nonStandardRankingFilter}
                onApply={action("apply")}
                onCancel={action("cancel")}
                anchorEl="screenshot-target"
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
            <RankingFilterDropdown
                measureItems={measureDropdownItems}
                attributeItems={attributeDropdownItems}
                filter={rankingFilter}
                onApply={action("apply")}
                onCancel={action("cancel")}
                anchorEl="screenshot-target"
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
