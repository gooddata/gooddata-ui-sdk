// (C) 2021 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";
import { ITheme } from "@gooddata/sdk-backend-spi";
import { LoadingSpinner } from "@gooddata/sdk-ui-kit";

interface ILoadingEqualizerProps {
    theme?: ITheme;
}

const LoadingEqualizer: React.FC<ILoadingEqualizerProps> = ({ theme }) => {
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

export default withTheme(LoadingEqualizer);
