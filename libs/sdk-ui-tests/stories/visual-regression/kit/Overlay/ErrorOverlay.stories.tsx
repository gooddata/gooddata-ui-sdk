// (C) 2022-2025 GoodData Corporation
import React from "react";

import { useIntl } from "react-intl";
import { action } from "storybook/actions";

import { withIntl } from "@gooddata/sdk-ui";
import { ErrorOverlay } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../../themeWrapper.js";

const bodyContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(80);

function ErrorOverlayExampleDefault() {
    return (
        <div className="library-component screenshot-target">
            <div>{bodyContent}</div>
            <ErrorOverlay onButtonClick={action("onButtonClick")} />
        </div>
    );
}

function ErrorOverlayExampleCustom() {
    const intl = useIntl();

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
}

const customMessages = {
    overlayTitle: "Things went wrong",
    overlayText: "There is nothing for you to do now{br}feel free to leave",
};

const WrappedErrorOverlayExampleDefault = withIntl(ErrorOverlayExampleDefault);
const WrappedErrorOverlayExampleCustom = withIntl(ErrorOverlayExampleCustom, undefined, customMessages);

export default {
    title: "12 UI Kit/ErrorOverlay",
};

const delayConfig = { delay: 200 };

export function Default() {
    return <WrappedErrorOverlayExampleDefault />;
}
Default.parameters = { kind: "default", screenshot: delayConfig };

export function Custom() {
    return <WrappedErrorOverlayExampleCustom />;
}
Custom.parameters = { kind: "custom", screenshot: delayConfig };

export const Themed = () => wrapWithTheme(<WrappedErrorOverlayExampleDefault />);
Themed.parameters = { kind: "themed", screenshot: delayConfig };
