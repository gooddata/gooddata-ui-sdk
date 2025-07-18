// (C) 2022-2025 GoodData Corporation

import { ReactNode } from "react";

import { wrapWithTheme } from "../../themeWrapper.js";
import { action } from "storybook/actions";
import { DialogList } from "@gooddata/sdk-ui-kit";
import { itemsMock as items } from "./itemsMock.js";

function Wrapper({ children }: { children?: ReactNode }) {
    return <div style={{ width: 350, maxHeight: 250, margin: "30 0", display: "flex" }}>{children}</div>;
}

function DialogListExamples() {
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
}

function DialogListLoadingExample() {
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
}

export default {
    title: "12 UI Kit/DialogList/DialogList",
};

export const FullFeatured = () => <DialogListExamples />;
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Loading = () => <DialogListLoadingExample />;
Loading.parameters = { kind: "loading" };

export const Themed = () => wrapWithTheme(<DialogListExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
