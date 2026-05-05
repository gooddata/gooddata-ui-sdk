// (C) 2026 GoodData Corporation

import { type ChangeEvent } from "react";

import { cloneDeep, set } from "lodash-es";
import { FormattedMessage, useIntl } from "react-intl";

import { UiIcon, UiLink } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../../locales.js";
import { customTooltipPlacementDropdownItems } from "../../../constants/dropdowns.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../../utils/translations.js";
import { DisabledBubbleMessage } from "../../DisabledBubbleMessage.js";
import { ConfigSection } from "../ConfigSection.js";
import { DropdownControl } from "../DropdownControl.js";

const FORMATTING_OPTIONS_DOC_URL =
    "https://www.gooddata.com/docs/cloud/create-visualizations/customizable-tooltips/";

export interface ICustomTooltipSectionProps {
    controlsDisabled: boolean;
    properties?: IVisualizationProperties;
    propertiesMeta?: any;
    pushData?: (data: any) => void;
}

export function CustomTooltipSection({
    controlsDisabled = false,
    properties = {},
    propertiesMeta = {},
    pushData = () => {},
}: ICustomTooltipSectionProps) {
    const intl = useIntl();
    const customTooltip = properties?.controls?.["customTooltip"];
    const enabled = customTooltip?.enabled ?? false;
    const content = customTooltip?.content ?? "";
    const placement = customTooltip?.placement ?? "above";

    const toggleDisabled = controlsDisabled;
    const contentDisabled = !enabled || controlsDisabled;

    const onContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const clonedProperties = cloneDeep(properties);
        set(clonedProperties, "controls.customTooltip.content", event.target.value);
        pushData({ properties: clonedProperties });
    };

    const placementItems = getTranslatedDropdownItems(customTooltipPlacementDropdownItems, intl);

    return (
        <ConfigSection
            id="custom_tooltip_section"
            valuePath="customTooltip.enabled"
            className="gd-custom-tooltip-section"
            title={messages.customTooltipTitle.id}
            propertiesMeta={propertiesMeta}
            properties={properties}
            canBeToggled
            toggleDisabled={toggleDisabled}
            toggledOn={enabled}
            pushData={pushData}
        >
            <DropdownControl
                value={placement}
                valuePath="customTooltip.placement"
                labelText={messages.customTooltipPlacement.id!}
                disabled={contentDisabled}
                showDisabledMessage={contentDisabled}
                properties={properties}
                pushData={pushData}
                items={placementItems}
                width={220}
            />
            <span className="input-label-text">
                <FormattedMessage id={messages.customTooltipContentLabel.id} />
            </span>
            <DisabledBubbleMessage showDisabledMessage={contentDisabled}>
                <textarea
                    className="gd-input-field gd-custom-tooltip-textarea s-custom-tooltip-textarea"
                    value={content}
                    onChange={onContentChange}
                    disabled={contentDisabled}
                    placeholder={intl.formatMessage({ id: messages.customTooltipPlaceholder.id })}
                    rows={8}
                />
            </DisabledBubbleMessage>
            <div className="gd-custom-tooltip-formatting-link">
                <UiLink
                    variant="secondary"
                    href={FORMATTING_OPTIONS_DOC_URL}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <UiIcon type="question" size={12} color="currentColor" />
                    <FormattedMessage id={messages.customTooltipFormattingOptions.id} />
                </UiLink>
            </div>
        </ConfigSection>
    );
}
