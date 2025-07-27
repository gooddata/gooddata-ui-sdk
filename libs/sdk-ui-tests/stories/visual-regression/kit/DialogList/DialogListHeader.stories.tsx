// (C) 2022-2025 GoodData Corporation

import { ReactNode } from "react";

import { BackstopConfig } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import { DialogListHeader } from "@gooddata/sdk-ui-kit";
import { action } from "storybook/actions";

function Wrapper({ children }: { children?: ReactNode }) {
    return <div style={{ width: 350, height: 80, margin: "30 0" }}>{children}</div>;
}

function DialogListHeaderExamples() {
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
}

const scenarios: BackstopConfig = {
    normal: {},
    hover: {
        hoverSelector: ".s-dialog-list-header-button",
        postInteractionWait: 100,
    },
};

export default {
    title: "12 UI Kit/DialogList/DialogListHeader",
};

export const FullFeatured = () => <DialogListHeaderExamples />;
FullFeatured.parameters = { kind: "full-featured", screenshots: scenarios };

export const Themed = () => wrapWithTheme(<DialogListHeaderExamples />);
Themed.parameters = { kind: "themed", screenshots: scenarios };
