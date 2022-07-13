// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Typography, Checkbox } from "@gooddata/sdk-ui-kit";

interface IVisualizationTitleConfigProps {
    // resetTitle: () => void;
    isHidingOfWidgetTitleEnabled: boolean;
    hideTitle: boolean;
    // setVisualPropsConfigurationTitle: (
    //     widgetRef: ObjRef,
    //     hideTitle: boolean,
    // ) => IVisualPropsConfigurationAction;
}

export function InsightTitleConfig(props: IVisualizationTitleConfigProps) {
    const {
        hideTitle,
        // widget,
        // setVisualPropsConfigurationTitle,
        isHidingOfWidgetTitleEnabled,
    } = props;

    const intl = useIntl();

    const [widgetTitleState, setWidgetTitleState] = useState(hideTitle);

    const handleHideTitleChange = (isChecked: boolean) => {
        setWidgetTitleState(isChecked);
        // setVisualPropsConfigurationTitle(widget, isChecked);
    };

    return (
        <>
            {isHidingOfWidgetTitleEnabled && (
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
            )}
        </>
    );
}
