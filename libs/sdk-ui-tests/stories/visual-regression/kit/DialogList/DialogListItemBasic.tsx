// (C) 2022 GoodData Corporation

import React from "react";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { BackstopConfig } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import { DialogListItemBasic, Icon } from "@gooddata/sdk-ui-kit";
import { action } from "@storybook/addon-actions";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

const Wrapper: React.FC<{ children?: React.ReactNode }> = (props) => {
    const { children } = props;
    return <div style={{ width: 350, height: 60, margin: "30 0" }}>{children}</div>;
};

/**
 * @internal
 */
export const DialogListItemBasicExamples: React.VFC = () => {
    const onClick = action("onClick");
    const onDelete = action("onDelete");
    const theme = useTheme();
    const icon = <Icon.QuestionMark color={theme?.palette?.complementary?.c5 ?? "blue"} />;
    const id = "id";
    const deleteTooltipText = "Delete me";

    return (
        <>
            <div className="library-component">
                <div className="screenshot-target">
                    <h4>Dialog list item basic</h4>
                    <Wrapper>
                        <DialogListItemBasic
                            item={{
                                id,
                                title: "List item title",
                                subtitle: "List item subtitle",
                                icon: icon,
                                deleteTooltipText,
                            }}
                            onClick={onClick}
                            onDelete={onDelete}
                        />
                    </Wrapper>
                </div>
                <div className="screenshot-target">
                    <h4>Dialog list item basic with shortened texts</h4>
                    <Wrapper>
                        <DialogListItemBasic
                            item={{
                                id,
                                title: "List item title item title item title item title item title",
                                subtitle: "List item subtitle item subtitle item subtitle item subtitle",
                                icon: icon,
                                deleteTooltipText,
                            }}
                            onClick={onClick}
                            onDelete={onDelete}
                        />
                    </Wrapper>
                </div>
                <div className="screenshot-target">
                    <h4>Dialog list item basic without subtitle</h4>
                    <Wrapper>
                        <DialogListItemBasic
                            item={{
                                id,
                                title: "List item",
                                icon: icon,
                                deleteTooltipText,
                            }}
                            onClick={onClick}
                            onDelete={onDelete}
                        />
                    </Wrapper>
                </div>
                <div className="screenshot-target">
                    <h4>Dialog list item basic without icon</h4>
                    <Wrapper>
                        <DialogListItemBasic
                            item={{
                                id,
                                title: "List item title",
                                subtitle: "List item subtitle",
                                deleteTooltipText,
                            }}
                            onClick={onClick}
                            onDelete={onDelete}
                        />
                    </Wrapper>
                </div>
                <div className="screenshot-target">
                    <h4>Dialog list item basic without delete button</h4>
                    <Wrapper>
                        <DialogListItemBasic
                            item={{
                                id,
                                title: "List item title",
                                subtitle: "List item subtitle",
                                icon: icon,
                                isDeletable: false,
                            }}
                            onClick={onClick}
                        />
                    </Wrapper>
                </div>
                <div className="screenshot-target">
                    <h4>Dialog list item basic that is not clickable</h4>
                    <Wrapper>
                        <DialogListItemBasic
                            item={{
                                id,
                                title: "List item title",
                                subtitle: "List item subtitle",
                                icon: icon,
                                isClickable: false,
                                deleteTooltipText,
                            }}
                            onClick={onClick}
                            onDelete={onDelete}
                        />
                    </Wrapper>
                </div>
                <div className="screenshot-target">
                    <h4>Dialog list item basic without delete button tooltip</h4>
                    <Wrapper>
                        <DialogListItemBasic
                            item={{
                                id,
                                title: "List item title",
                                subtitle: "List item subtitle",
                                icon: icon,
                            }}
                            onClick={onClick}
                            onDelete={onDelete}
                        />
                    </Wrapper>
                </div>
                <div className="screenshot-target">
                    <h4>Dialog list item basic disabled</h4>
                    <Wrapper>
                        <DialogListItemBasic
                            item={{
                                id,
                                title: "List item title",
                                subtitle: "List item subtitle",
                                icon: icon,
                                isDisabled: true,
                                deleteTooltipText,
                            }}
                            onClick={onClick}
                            onDelete={onDelete}
                        />
                    </Wrapper>
                </div>
                <div className="screenshot-target">
                    <h4>Dialog list item basic disabled with shortened texts</h4>
                    <Wrapper>
                        <DialogListItemBasic
                            item={{
                                id,
                                title: "List item title item title item title item title item title",
                                subtitle: "List item subtitle item subtitle item subtitle item subtitle",
                                icon: icon,
                                isDisabled: true,
                                deleteTooltipText,
                            }}
                            onClick={onClick}
                            onDelete={onDelete}
                        />
                    </Wrapper>
                </div>
            </div>
        </>
    );
};

const testItemSelector = ".s-dialog-list-item-basic";

const scenarios: BackstopConfig = {
    normal: {},
    hover: {
        hoverSelector: testItemSelector,
        postInteractionWait: 100,
    },
    "hover-delete": {
        hoverSelectors: [testItemSelector, 100, `${testItemSelector} .s-dialog-list-item-delete-icon`, 100],
    },
};

storiesOf(`${UiKit}/DialogList/DialogListItemBasic`)
    .add("full-featured", () => <DialogListItemBasicExamples />, { screenshots: scenarios })
    .add("themed", () => wrapWithTheme(<DialogListItemBasicExamples />), { screenshots: scenarios });
