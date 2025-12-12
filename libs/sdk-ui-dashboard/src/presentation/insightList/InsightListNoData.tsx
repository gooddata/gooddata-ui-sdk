// (C) 2022-2025 GoodData Corporation

import { type MouseEvent } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

export interface IVisualizationListNoDataProps {
    hasNoMatchingData: boolean;
    isUserInsights: boolean;
    showNoDataCreateButton?: boolean;
    onCreateButtonClick: (event: MouseEvent) => void;
}

export function InsightListNoData({
    hasNoMatchingData,
    isUserInsights,
    showNoDataCreateButton,
    onCreateButtonClick,
}: IVisualizationListNoDataProps) {
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
}
