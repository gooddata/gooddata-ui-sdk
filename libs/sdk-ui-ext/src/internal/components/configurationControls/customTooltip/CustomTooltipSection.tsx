// (C) 2026 GoodData Corporation

import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { cloneDeep, set } from "lodash-es";
import { FormattedMessage, useIntl } from "react-intl";

import { useDebounce } from "@gooddata/sdk-ui";
import { UiIcon, UiLink } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../../locales.js";
import { customTooltipPlacementDropdownItems } from "../../../constants/dropdowns.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../../utils/translations.js";
import { DisabledBubbleMessage } from "../../DisabledBubbleMessage.js";
import { ConfigSection } from "../ConfigSection.js";
import { DropdownControl } from "../DropdownControl.js";

const FORMATTING_OPTIONS_DOC_URL =
    "https://www.gooddata.com/docs/cloud/create-visualizations/custom-tooltips/";

// Debouncing at the source keeps each per-keystroke change from re-firing
// the chart's secondary tooltip execution downstream.
const CONTENT_DEBOUNCE_MS = 500;

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

    const [localContent, setLocalContent] = useState(content);

    // Tracks what we last pushed upstream so the sync Effect below can
    // distinguish "external content change" (undo/redo, viz switch, loaded
    // properties) from in-progress local typing.
    const lastPushedContentRef = useRef(content);

    const latestContentRef = useRef(content);

    const pushContent = (newContent: string) => {
        lastPushedContentRef.current = newContent;
        const clonedProperties = cloneDeep(properties);
        set(clonedProperties, "controls.customTooltip.content", newContent);
        pushData({ properties: clonedProperties });
    };

    const pushContentRef = useRef(pushContent);
    useEffect(() => {
        pushContentRef.current = pushContent;
    });

    const debouncedPushContent = useDebounce(pushContent, CONTENT_DEBOUNCE_MS);

    // Cancelling a lodash debounce timer is a side effect React can't do
    // during render, so the matching local-state alignment lives with it here
    // rather than splitting across a render-time setState + a cancel Effect.
    useEffect(() => {
        if (content !== lastPushedContentRef.current) {
            debouncedPushContent.cancel();
            lastPushedContentRef.current = content;
            latestContentRef.current = content;
            setLocalContent(content);
        }
    }, [content, debouncedPushContent]);

    // useDebounce's cancel-on-unmount runs first (cleanups fire in declaration order), so flush() is a no-op — push directly.
    useEffect(() => {
        return () => {
            if (latestContentRef.current !== lastPushedContentRef.current) {
                pushContentRef.current(latestContentRef.current);
            }
        };
    }, []);

    const onContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setLocalContent(event.target.value);
        latestContentRef.current = event.target.value;
        debouncedPushContent(event.target.value);
    };

    // Commit any pending content immediately when the textarea loses focus
    // (e.g. clicking the placement dropdown or Save). Without this, content
    // typed within the debounce window right before saving is dropped, and the
    // trailing push lands after the save and re-dirties the just-saved insight.
    const onContentBlur = () => {
        debouncedPushContent.flush();
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
                    value={localContent}
                    onChange={onContentChange}
                    onBlur={onContentBlur}
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
