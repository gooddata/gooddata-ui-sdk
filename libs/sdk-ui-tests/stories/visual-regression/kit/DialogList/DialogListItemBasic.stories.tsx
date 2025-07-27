// (C) 2022-2025 GoodData Corporation

import { ReactNode } from "react";

import { BackstopConfig } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import { DialogListItemBasic, Icon } from "@gooddata/sdk-ui-kit";
import { action } from "storybook/actions";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

function Wrapper({ children }: { children?: ReactNode }) {
    return <div style={{ width: 350, height: 60, margin: "30 0" }}>{children}</div>;
}

function DialogListItemBasicExamples() {
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
}

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

export default {
    title: "12 UI Kit/DialogList/DialogListItemBasic",
};

export const FullFeatured = () => <DialogListItemBasicExamples />;
FullFeatured.parameters = { kind: "full-featured", screenshots: scenarios };

export const Themed = () => wrapWithTheme(<DialogListItemBasicExamples />);
Themed.parameters = { kind: "themed", screenshots: scenarios };
