// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export interface IAttributeFilterConfigurationButtonProps {
    onConfiguration: () => void;
}

const ALIGN_POINTS = [{ align: "bc tc", offset: { x: -1, y: 5 } }];

/**
 * @internal
 */
export const AttributeFilterConfigurationButton: React.VFC<IAttributeFilterConfigurationButtonProps> = (
    props,
) => {
    const { onConfiguration } = props;

    return (
        <div className="gd-attribute-filter-configuration-button">
            <BubbleHoverTrigger>
                <Button
                    className="gd-button-link gd-button-icon-only gd-icon-settings gd-button-small gd-configuration-button s-configuration-button"
                    disabled={false}
                    onClick={onConfiguration}
                />
                <Bubble className={`bubble-primary`} alignPoints={ALIGN_POINTS}>
                    <FormattedMessage id="attributesDropdown.configuration" />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
