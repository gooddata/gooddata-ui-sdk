// (C) 2022 GoodData Corporation

import React from "react";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { BackstopConfig } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import { DialogListHeader } from "@gooddata/sdk-ui-kit";
import { action } from "@storybook/addon-actions";

const Wrapper: React.FC<{ children?: React.ReactNode }> = (props) => {
    const { children } = props;
    return <div style={{ width: 350, height: 80, margin: "30 0" }}>{children}</div>;
};

/**
 * @internal
 */
export const DialogListHeaderExamples: React.VFC = () => {
    const onButtonClick = action("onButtonClick");

    return (
        <>
            <div className="library-component">
                <div className="screenshot-target">
                    <h4>Dialog list header</h4>
                    <Wrapper>
                        <DialogListHeader
                            title="Items"
                            buttonTitle="Add"
                            buttonTooltipText="Add a new item"
                            onButtonClick={onButtonClick}
                        />
                    </Wrapper>
                </div>
                <div className="screenshot-target">
                    <h4>Dialog list header with disabled button</h4>
                    <Wrapper>
                        <DialogListHeader
                            title="Collection"
                            buttonTitle="Add"
                            buttonDisabled={true}
                            buttonTooltipText="You cannot add new items"
                            onButtonClick={onButtonClick}
                        />
                    </Wrapper>
                </div>
                <div className="screenshot-target">
                    <h4>Dialog list header with no button tooltip</h4>
                    <Wrapper>
                        <DialogListHeader title="Items" buttonTitle="Add" onButtonClick={onButtonClick} />
                    </Wrapper>
                </div>
                <div className="screenshot-target">
                    <h4>Dialog list header with no button icon</h4>
                    <Wrapper>
                        <DialogListHeader
                            gdIconName=""
                            title="Stuff"
                            buttonTitle="Add"
                            buttonTooltipText="Add a new item"
                            onButtonClick={onButtonClick}
                        />
                    </Wrapper>
                </div>
                <div className="screenshot-target">
                    <h4>Dialog list header with different button icon</h4>
                    <Wrapper>
                        <DialogListHeader
                            gdIconName="gd-icon-clock"
                            title="Items"
                            buttonTitle="Add"
                            buttonTooltipText="Add a new item"
                            onButtonClick={onButtonClick}
                        />
                    </Wrapper>
                </div>
                <div className="screenshot-target">
                    <h4>Dialog list header with no title</h4>
                    <Wrapper>
                        <DialogListHeader buttonTitle="Create" onButtonClick={onButtonClick} />
                    </Wrapper>
                </div>
                <div className="screenshot-target">
                    <h4>Dialog list header with no button</h4>
                    <Wrapper>
                        <DialogListHeader title="Items" />
                    </Wrapper>
                </div>
            </div>
        </>
    );
};

const scenarios: BackstopConfig = {
    normal: {},
    hover: {
        hoverSelector: ".s-dialog-list-header-button",
        postInteractionWait: 100,
    },
};

storiesOf(`${UiKit}/DialogList/DialogListHeader`)
    .add("full-featured", () => <DialogListHeaderExamples />, { screenshots: scenarios })
    .add("themed", () => wrapWithTheme(<DialogListHeaderExamples />), { screenshots: scenarios });
