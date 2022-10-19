// (C) 2022 GoodData Corporation

import React from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";
import { INoDataButton } from "./types";

export interface IVisualizationListNoDataProps {
    hasNoMatchingData: boolean;
    isUserInsights: boolean;
    button?: INoDataButton;
}

export const InsightListNoData: React.FC<IVisualizationListNoDataProps> = ({
    hasNoMatchingData,
    isUserInsights,
    button,
}) => {
    return (
        <div
            className={cx("gd-visualizations-list-no-data", "gd-no-data", {
                "gd-visualization-list-not-found": hasNoMatchingData,
            })}
        >
            {hasNoMatchingData ? (
                <span className="s-visualization-list-no-data-message">
                    <FormattedMessage id="visualizationsList.noVisualizationsFound" />
                </span>
            ) : (
                <>
                    <span className="s-visualization-list-no-data-message">
                        {isUserInsights ? (
                            <FormattedMessage id="visualizationsList.noUserInsights" />
                        ) : (
                            <FormattedMessage id="visualizationsList.noInsights" />
                        )}
                    </span>{" "}
                    {button ? (
                        <Button
                            className={`gd-button-link ${button.className}`}
                            tagName="a"
                            onClick={button.onClick}
                            value={button.value}
                        />
                    ) : null}
                </>
            )}
        </div>
    );
};
