// (C) 2022 GoodData Corporation
import React from "react";
import { wrapWithTheme } from "../../themeWrapper.js";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { ErrorOverlay } from "@gooddata/sdk-ui-kit";
import { withIntl } from "@gooddata/sdk-ui";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { action } from "@storybook/addon-actions";

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

storiesOf(`${UiKit}/ErrorOverlay`)
    .add("default", () => <WrappedErrorOverlayExampleDefault />, { screenshot: true })
    .add("custom", () => <WrappedErrorOverlayExampleCustom />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<WrappedErrorOverlayExampleDefault />), {
        screenshot: { delay: 200 }, // without delay, the used button may not be themed yet
    });
