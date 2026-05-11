// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";
import { UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";

import { useMeasureValueFilterDetails } from "./useMeasureValueFilterDetails.js";

/**
 * Props for {@link MeasureValueFilterDetailsBubble}.
 *
 * @internal
 */
export interface IMeasureValueFilterDetailsBubbleProps {
    /**
     * Title of the metric. Always displayed; details below are loaded lazily.
     */
    title: string;
    /**
     * Loader invoked the first time the bubble opens. The bubble shows a loading
     * indicator until it resolves.
     */
    requestHandler?: () => Promise<IMeasureMetadataObject | undefined>;
}

/**
 * Info bubble showing metric details when the question icon is hovered/focused.
 *
 * @internal
 */
export function MeasureValueFilterDetailsBubble({
    title,
    requestHandler,
}: IMeasureValueFilterDetailsBubbleProps) {
    const [isOpen, setIsOpen] = useState(false);
    const intl = useIntl();

    const { details, isLoading, error } = useMeasureValueFilterDetails({ isOpen, requestHandler });

    const handleOpen = useCallback(() => setIsOpen(true), []);
    const handleClose = useCallback(() => setIsOpen(false), []);

    const tooltipContent = (
        <div className="gd-mvf-details-bubble s-mvf-details-bubble">
            <div className="gd-mvf-details-bubble__content">
                <div className="gd-mvf-details-bubble__section">
                    <h3 className="gd-mvf-details-bubble__title">{details?.title ?? title}</h3>
                    {details?.description ? (
                        <p className="gd-mvf-details-bubble__description">{details.description}</p>
                    ) : null}
                </div>
                <div className="gd-mvf-details-bubble__section">
                    <span className="gd-mvf-details-bubble__key">
                        <FormattedMessage {...messages["measureValueFilterDetailsType"]} />
                    </span>
                    <span className="gd-mvf-details-bubble__value">
                        <FormattedMessage {...messages["measureValueFilterDetailsTypeValue"]} />
                    </span>
                </div>
                {isLoading ? (
                    <div className="gd-mvf-details-bubble__section">
                        <span className="gd-mvf-details-bubble__loading">
                            <FormattedMessage id="loading" />
                        </span>
                    </div>
                ) : error ? (
                    <div className="gd-mvf-details-bubble__section">
                        <span className="gd-mvf-details-bubble__error">{error.message}</span>
                    </div>
                ) : details ? (
                    <>
                        {details.expression ? (
                            <div className="gd-mvf-details-bubble__section">
                                <span className="gd-mvf-details-bubble__key">
                                    <FormattedMessage {...messages["measureValueFilterDetailsDefinedAs"]} />
                                </span>
                                <span className="gd-mvf-details-bubble__value gd-mvf-details-bubble__expression">
                                    {details.expression}
                                </span>
                            </div>
                        ) : null}
                        {details.id ? (
                            <div className="gd-mvf-details-bubble__section">
                                <span className="gd-mvf-details-bubble__key">
                                    <FormattedMessage {...messages["measureValueFilterDetailsId"]} />
                                </span>
                                <span className="gd-mvf-details-bubble__value">{details.id}</span>
                            </div>
                        ) : null}
                    </>
                ) : null}
            </div>
        </div>
    );

    return (
        <span className="gd-mvf-details-bubble__trigger">
            <UiTooltip
                anchor={
                    <span className="s-mvf-details-trigger">
                        <UiIconButton
                            icon="question"
                            size="xsmall"
                            variant="tertiary"
                            iconColor="complementary-7"
                            label={intl.formatMessage(messages["measureValueFilterDetailsInfoButtonLabel"])}
                            accessibilityConfig={{
                                ariaLabel: intl.formatMessage(
                                    messages["measureValueFilterDetailsInfoButtonLabel"],
                                ),
                                ariaExpanded: isOpen,
                            }}
                            dataTestId="mvf-details-trigger"
                        />
                    </span>
                }
                content={tooltipContent}
                triggerBy={["hover", "focus"]}
                onOpen={handleOpen}
                onClose={handleClose}
                arrowPlacement="left"
                showArrow={false}
                behaviour="tooltip"
                variant="none"
                accessibilityConfig={{
                    ariaLabel: intl.formatMessage(messages["measureValueFilterDetailsInfoButtonLabel"]),
                }}
            />
        </span>
    );
}
