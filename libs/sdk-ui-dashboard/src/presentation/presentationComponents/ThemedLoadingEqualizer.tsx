// (C) 2021 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { LoadingSpinner } from "@gooddata/sdk-ui-kit";

export const ThemedLoadingEqualizer: React.FC = () => {
    const theme = useTheme();

    return (
        <div className="gd-loading-equalizer-wrap">
            <div className="gd-loading-equalizer gd-loading-equalizer-fade">
                <LoadingSpinner
                    className="large gd-loading-equalizer-spinner"
                    color={theme?.palette?.complementary?.c9}
                />
                <FormattedMessage id="loading" />
            </div>
        </div>
    );
};
