// (C) 2022 GoodData Corporation

import React from "react";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import { action } from "@storybook/addon-actions";
import { DialogList } from "@gooddata/sdk-ui-kit";
import { itemsMock as items } from "./itemsMock.js";

const Wrapper: React.FC<{ children?: React.ReactNode }> = (props) => {
    const { children } = props;
    return <div style={{ width: 350, maxHeight: 250, margin: "30 0", display: "flex" }}>{children}</div>;
};

/**
 * @internal
 */
export const DialogListExamples: React.VFC = () => {
    const onItemClick = action("onItemClick");
    const onItemDelete = action("onItemDelete");
    const emptyMessageElement = (
        <span>
            There are no items here.
            <br /> Add something.
        </span>
    );

    return (
        <>
            <div className="library-component">
                <div className="screenshot-target">
                    <h4>Dialog list</h4>
                    <Wrapper>
                        <DialogList
                            items={items.slice(1, 4)}
                            onItemClick={onItemClick}
                            onItemDelete={onItemDelete}
                        />
                    </Wrapper>
                </div>
                <div className="screenshot-target">
                    <h4>Dialog list with many items</h4>
                    <Wrapper>
                        <DialogList items={items} onItemClick={onItemClick} onItemDelete={onItemDelete} />
                    </Wrapper>
                </div>
                <div className="screenshot-target">
                    <h4>Dialog list with no items</h4>
                    <Wrapper>
                        <DialogList
                            items={[]}
                            onItemClick={onItemClick}
                            onItemDelete={onItemDelete}
                            emptyMessageElement={emptyMessageElement}
                        />
                    </Wrapper>
                </div>
            </div>
        </>
    );
};

export const DialogListLoadingExample: React.FC = () => {
    return (
        <div className="library-component">
            <div className="screenshot-target">
                <h4>Dialog list loading</h4>
                <Wrapper>
                    <DialogList items={[]} isLoading={true} />
                </Wrapper>
            </div>
        </div>
    );
};

storiesOf(`${UiKit}/DialogList/DialogList`)
    .add("full-featured", () => <DialogListExamples />, { screenshot: true })
    .add("loading", () => <DialogListLoadingExample />)
    .add("themed", () => wrapWithTheme(<DialogListExamples />), { screenshot: true });
