// (C) 2007-2026 GoodData Corporation

import { memo } from "react";

import classNames from "classnames";
import { FormattedMessage } from "react-intl";

import { ConfigPanelClassName } from "@gooddata/sdk-ui-ext/internal";

interface IConfigurationPanelProps {
    isCollapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    appSessionId: string;
    visualizationType: string;
}

export const ConfigurationPanel = memo(function ConfigurationPanel({
    isCollapsed,
    setCollapsed,
    appSessionId,
    visualizationType,
}: IConfigurationPanelProps) {
    const getHeaderClasses = () => {
        return classNames("bucket-title", "bucket-title-configuration-panel");
    };

    const getConfigurationPanelClasses = () => {
        return classNames(
            "adi-bucket",
            "bucket-configuration",
            {
                "has-rounded-corners": true,
                "bucket-collapsed": isCollapsed,
            },
            "s-configuration-panel",
        );
    };

    const getConfigurationPanelContentClasses = () => {
        /*
         * Note: the Pluggable Visualization locates div for configuration panel using the
         *  `${ConfigPanelClassName}-${appSessionId}` selector. This is essential for correct
         *  cleanup during 'Clear' operation.
         *
         * Without this appSessionId, the old plug viz would try to unmount from the same div where
         * new plug viz tries to mount the config panel - leading to react errors and mounted component leaks.
         */

        return classNames(
            ConfigPanelClassName,
            `${ConfigPanelClassName}-${appSessionId}`,
            `${ConfigPanelClassName}-${visualizationType}`,
            {
                invisible: isCollapsed,
            },
            "s-configuration-panel-content",
        );
    };

    const getSeparatorClasses = () => {
        return classNames("adi-bucket-invitation-separator", {
            invisible: isCollapsed,
        });
    };

    const toggleConfigurationPanel = () => {
        if (isCollapsed) {
            setCollapsed(false);
        }
    };

    // We need add appSessionId as a key to the root div to force re-rendering of the configuration panel
    // if not strange things happen when opening different visualizations and resetting
    // Plugglable visualization explodes on unmount node
    // Same approach was used in Report.tsx so we copied it here and fix unmount error
    return (
        <div className={getConfigurationPanelClasses()} key={appSessionId}>
            <div className={getHeaderClasses()} onClick={toggleConfigurationPanel}>
                <div className="bucket-title-icon" />
                <h3>
                    <FormattedMessage id="configurationPanel.title" />
                </h3>
            </div>
            <div className="bucket-contents">
                <hr className={getSeparatorClasses()} />
                <div key={visualizationType} className={getConfigurationPanelContentClasses()} />
            </div>
        </div>
    );
});
