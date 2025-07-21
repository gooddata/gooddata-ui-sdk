// (C) 2022-2025 GoodData Corporation
import React from "react";
import { wrapWithTheme } from "../../themeWrapper.js";

import { ErrorOverlay } from "@gooddata/sdk-ui-kit";
import { withIntl } from "@gooddata/sdk-ui";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { action } from "storybook/actions";

const bodyContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(80);

const ErrorOverlayExampleDefault: React.FC = () => {
    return (
        <div className="library-component screenshot-target">
            <div>{bodyContent}</div>
            <ErrorOverlay onButtonClick={action("onButtonClick")} />
        </div>
    );
};

const ErrorOverlayExampleCustom: React.FC<WrappedComponentProps> = ({ intl }) => {
    const title = intl.formatMessage({ id: "overlayTitle" });
    const text = intl.formatMessage(
        {
            id: "overlayText",
        },
        {
            br: <br />,
        },
    );

    return (
        <div className="library-component screenshot-target">
            <div>{bodyContent}</div>
            <ErrorOverlay showIcon={false} showButton={false} text={text} title={title} />
        </div>
    );
};

const customMessages = {
    overlayTitle: "Things went wrong",
    overlayText: "There is nothing for you to do now{br}feel free to leave",
};

const WrappedErrorOverlayExampleDefault = withIntl(ErrorOverlayExampleDefault);
const WrappedErrorOverlayExampleCustom = withIntl(
    injectIntl(ErrorOverlayExampleCustom),
    undefined,
    customMessages,
);

export default {
    title: "12 UI Kit/ErrorOverlay",
};

const delayConfig = { delay: 200 };

export const Default = () => <WrappedErrorOverlayExampleDefault />;
Default.parameters = { kind: "default", screenshot: delayConfig };

export const Custom = () => <WrappedErrorOverlayExampleCustom />;
Custom.parameters = { kind: "custom", screenshot: delayConfig };

export const Themed = () => wrapWithTheme(<WrappedErrorOverlayExampleDefault />);
Themed.parameters = { kind: "themed", screenshot: delayConfig };
