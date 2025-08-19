// (C) 2022-2025 GoodData Corporation

import React from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

export interface IVisualizationListNoDataProps {
    hasNoMatchingData: boolean;
    isUserInsights: boolean;
    showNoDataCreateButton?: boolean;
    onCreateButtonClick: (event: React.MouseEvent) => void;
}

export const InsightListNoData: React.FC<IVisualizationListNoDataProps> = ({
    hasNoMatchingData,
    isUserInsights,
    showNoDataCreateButton,
    onCreateButtonClick,
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
                    {showNoDataCreateButton ? (
                        <Button
                            className="gd-button-link s-create-new-insight"
                            tagName="a"
                            onClick={onCreateButtonClick}
                            value={<FormattedMessage id="visualizationsList.create" />}
                        />
                    ) : null}
                </>
            )}
        </div>
    );
};
