// (C) 2007-2025 GoodData Corporation

import { useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { IInsightWidget } from "@gooddata/sdk-model";
import { Checkbox, Typography } from "@gooddata/sdk-ui-kit";

interface IVisualizationTitleConfigProps {
    widget: IInsightWidget;
    hideTitle: boolean;
    isHidingOfWidgetTitleEnabled: boolean;
    setVisualPropsConfigurationTitle: (widget: IInsightWidget, hideTitle: boolean) => void;
}

export function InsightTitleConfig({
    hideTitle,
    widget,
    setVisualPropsConfigurationTitle,
    isHidingOfWidgetTitleEnabled,
}: IVisualizationTitleConfigProps) {
    const intl = useIntl();

    const [widgetTitleState, setWidgetTitleState] = useState(hideTitle);

    const handleHideTitleChange = (isChecked: boolean) => {
        setWidgetTitleState(isChecked);
        setVisualPropsConfigurationTitle(widget, isChecked);
    };

    return (
        <>
            {isHidingOfWidgetTitleEnabled ? (
                <div className="configuration-category s-hide-title-configuration">
                    <Typography tagName="h3" className="s-viz-title-headline">
                        <FormattedMessage id="configurationPanel.visualprops.sectionTitle" />
                    </Typography>
                    <Checkbox
                        onChange={handleHideTitleChange}
                        value={widgetTitleState}
                        text={intl.formatMessage({ id: "configurationPanel.visualprops.hideTitle" })}
                        labelSize="small"
                    />
                </div>
            ) : null}
        </>
    );
}
