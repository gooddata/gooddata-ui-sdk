// (C) 2025-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import {
    type IAttributeDisplayFormMetadataObject,
    type IAttributeElement,
    type IAttributeMetadataObject,
    type ObjRef,
} from "@gooddata/sdk-model";
import { UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../locales.js";
import { useAttributeFilterDetails } from "../../hooks/useAttributeFilterDetails.js";

/**
 * Props for AttributeFilterDetailsBubble component.
 *
 * @internal
 */
export interface IAttributeFilterDetailsBubbleProps {
    /** The attribute metadata object (loaded by root component) */
    attribute: IAttributeMetadataObject;
    /** The display form (label) currently used by the filter */
    label: IAttributeDisplayFormMetadataObject;
    /** Callback triggered on bubble open; loads up to 5 sample elements */
    requestHandler: (labelRef: ObjRef) => Promise<{ elements: IAttributeElement[]; totalCount: number }>;
}

/**
 * Info bubble showing attribute details when the question mark icon is clicked.
 * Displays attribute title, description, label name, and sample element values.
 *
 * @internal
 */
export function AttributeFilterDetailsBubble({
    attribute,
    label,
    requestHandler,
}: IAttributeFilterDetailsBubbleProps) {
    const [isOpen, setIsOpen] = useState(false);
    const intl = useIntl();

    const { elements, totalCount, isLoading, error } = useAttributeFilterDetails({
        isOpen,
        labelRef: label.ref,
        requestHandler,
    });

    const handleOpen = useCallback(() => {
        setIsOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    const getElementDisplayText = (element: IAttributeElement) => {
        const title = element.formattedTitle ?? element.title;
        return title ?? `(${intl.formatMessage({ id: "empty_value" })})`;
    };

    const remainingCount = totalCount - elements.length;

    const tooltipContent = (
        <div className="gd-attribute-filter-details-bubble s-attribute-filter-details-bubble">
            <div className="gd-attribute-filter-details-bubble__content">
                <div className="gd-attribute-filter-details-bubble__section">
                    <h3 className="gd-attribute-filter-details-bubble__title">{attribute.title}</h3>
                    {attribute.description ? (
                        <p className="gd-attribute-filter-details-bubble__description">
                            {attribute.description}
                        </p>
                    ) : null}
                </div>
                <div className="gd-attribute-filter-details-bubble__section">
                    <span className="gd-attribute-filter-details-bubble__key">
                        <FormattedMessage {...messages["attributeFilterDetailsType"]} />
                    </span>
                    <span className="gd-attribute-filter-details-bubble__value">
                        <FormattedMessage {...messages["attributeFilterDetailsTypeValue"]} />
                    </span>
                </div>
                <div className="gd-attribute-filter-details-bubble__section">
                    <span className="gd-attribute-filter-details-bubble__key">
                        <FormattedMessage {...messages["attributeFilterDetailsLabel"]} />
                    </span>
                    <span className="gd-attribute-filter-details-bubble__value">{label.title}</span>
                </div>
                {attribute.dataSet ? (
                    <div className="gd-attribute-filter-details-bubble__section">
                        <span className="gd-attribute-filter-details-bubble__key">
                            <FormattedMessage {...messages["attributeFilterDetailsDataset"]} />
                        </span>
                        <span className="gd-attribute-filter-details-bubble__value">
                            {attribute.dataSet.title}
                        </span>
                    </div>
                ) : null}
                <div className="gd-attribute-filter-details-bubble__section">
                    <span className="gd-attribute-filter-details-bubble__key">
                        <FormattedMessage id="attributeFilter.text.arbitrary.values" />
                    </span>
                    <div className="gd-attribute-filter-details-bubble__value gd-attribute-filter-details-bubble__elements">
                        {isLoading ? (
                            <span className="gd-attribute-filter-details-bubble__loading">
                                <FormattedMessage id="loading" />
                            </span>
                        ) : error ? (
                            <span className="gd-attribute-filter-details-bubble__error">{error.message}</span>
                        ) : (
                            <>
                                {elements.map((element, idx) => (
                                    <span
                                        key={element.uri ?? idx}
                                        className="gd-attribute-filter-details-bubble__element s-attribute-filter-details-element"
                                    >
                                        {getElementDisplayText(element)}
                                        <br />
                                    </span>
                                ))}
                                {remainingCount > 0 && (
                                    <span className="gd-attribute-filter-details-bubble__more">
                                        <FormattedMessage
                                            {...messages["attributeFilterDetailsElementsMore"]}
                                            values={{
                                                count: remainingCount,
                                            }}
                                        />
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <div className="gd-attribute-filter-details-bubble__section">
                    <span className="gd-attribute-filter-details-bubble__key">
                        <FormattedMessage {...messages["attributeFilterDetailsId"]} />
                    </span>
                    <span className="gd-attribute-filter-details-bubble__value">{attribute.id}</span>
                </div>
            </div>
        </div>
    );

    return (
        <span className="gd-attribute-filter-details-bubble__trigger">
            <UiTooltip
                anchor={
                    <span className="s-attribute-filter-details-trigger">
                        <UiIconButton
                            icon="question"
                            size="xsmall"
                            variant="tertiary"
                            iconColor="complementary-7"
                            label={intl.formatMessage(messages["attributeFilterDetailsInfoButtonLabel"])}
                            accessibilityConfig={{
                                ariaLabel: intl.formatMessage(
                                    messages["attributeFilterDetailsInfoButtonLabel"],
                                ),
                                ariaExpanded: isOpen,
                            }}
                            dataTestId="attribute-filter-details-trigger"
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
                    ariaLabel: intl.formatMessage(messages["attributeFilterDetailsInfoButtonLabel"]),
                }}
            />
        </span>
    );
}
