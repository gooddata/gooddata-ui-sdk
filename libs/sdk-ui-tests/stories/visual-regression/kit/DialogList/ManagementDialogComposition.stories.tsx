// (C) 2022-2025 GoodData Corporation

import { ReactNode } from "react";

import { wrapWithTheme } from "../../themeWrapper.js";
import { action } from "storybook/actions";
import { ConfirmDialogBase, ContentDivider, DialogList, DialogListHeader } from "@gooddata/sdk-ui-kit";
import { itemsMock as items } from "./itemsMock.js";

import "./styles.scss";

function Wrapper({ children }: { children?: ReactNode }) {
    return <div style={{ margin: "30 0" }}>{children}</div>;
}

const onSubmit = action("onSubmit");
const onClose = action("onClose");
const onCancel = action("onCancel");
const onHeaderButtonClick = action("onHeaderButtonClick");

/**
 *
 * Management dialog composition example.
 *
 * Generic management dialog may be composed by using DialogHeader and DialogList with DialogListItem
 * inside ConfirmDialog (or any Dialog) component. In overlay use-cases use ConfirmDialog instead of ConfirmDialogBase.
 * Some general dialog styles may be necessary to limit the dialog dimensions. See ./styles.scss file.
 * List items may be customized by creating new DialogListItem component.
 *
 * @internal
 */
function ManagementDialogCompositionExamples() {
    const onItemClick = action("onItemClick");
    const onItemDelete = action("onItemDelete");

    const emptyMessageElement = (
        <span>
            There are no items here.
            <br />
            Add something.
        </span>
    );

    return (
        <>
            <div className="screenshot-target">
                <div className="library-component">
                    <h4>Management dialog composition example</h4>
                </div>
                <Wrapper>
                    <ConfirmDialogBase
                        className="gd-management-dialog s-management-dialog"
                        headline="Management dialog"
                        cancelButtonText="Cancel"
                        onCancel={onCancel}
                        onClose={onClose}
                    >
                        <DialogListHeader
                            title="Items list"
                            buttonTitle="Create"
                            buttonDisabled={false}
                            buttonTooltipText="Create a new item"
                            onButtonClick={onHeaderButtonClick}
                        />
                        <DialogList
                            items={items.slice(1, 4)}
                            emptyMessageElement={emptyMessageElement}
                            onItemClick={onItemClick}
                            onItemDelete={onItemDelete}
                        />
                        <ContentDivider />
                    </ConfirmDialogBase>
                </Wrapper>
            </div>
            <div className="screenshot-target">
                <div className="library-component">
                    <h4>Management dialog composition example with many items</h4>
                </div>
                <Wrapper>
                    <ConfirmDialogBase
                        className="gd-management-dialog s-management-dialog"
                        headline="Management dialog"
                        cancelButtonText="Cancel"
                        onCancel={onCancel}
                        onClose={onClose}
                    >
                        <DialogListHeader
                            title="Items list"
                            buttonTitle="Add"
                            buttonDisabled={false}
                            buttonTooltipText="Add a new item"
                            onButtonClick={onHeaderButtonClick}
                        />
                        <DialogList
                            items={items}
                            emptyMessageElement={emptyMessageElement}
                            onItemClick={onItemClick}
                            onItemDelete={onItemDelete}
                        />
                        <ContentDivider />
                    </ConfirmDialogBase>
                </Wrapper>
            </div>
            <div className="screenshot-target">
                <div className="library-component">
                    <h4>Management dialog composition example with no items</h4>
                </div>
                <Wrapper>
                    <ConfirmDialogBase
                        className="gd-management-dialog s-management-dialog"
                        headline="Management dialog"
                        cancelButtonText="Cancel"
                        onCancel={onCancel}
                        onClose={onClose}
                    >
                        <DialogListHeader
                            title="Items list"
                            buttonTitle="Add"
                            buttonDisabled={false}
                            buttonTooltipText="Add a new item"
                            onButtonClick={onHeaderButtonClick}
                        />
                        <DialogList
                            items={[]}
                            emptyMessageElement={emptyMessageElement}
                            onItemClick={onItemClick}
                            onItemDelete={onItemDelete}
                        />
                        <ContentDivider />
                    </ConfirmDialogBase>
                </Wrapper>
            </div>
            <div className="screenshot-target">
                <div className="library-component">
                    <h4>Management dialog composition example with submit button</h4>
                </div>
                <Wrapper>
                    <ConfirmDialogBase
                        className="gd-management-dialog s-management-dialog"
                        headline="Management dialog"
                        submitButtonText="Submit"
                        cancelButtonText="Cancel"
                        onCancel={onCancel}
                        onClose={onClose}
                        onSubmit={onSubmit}
                    >
                        <DialogListHeader
                            title="Items list"
                            buttonTitle="Add"
                            buttonDisabled={false}
                            buttonTooltipText="Add a new item"
                            onButtonClick={onHeaderButtonClick}
                        />
                        <DialogList
                            items={[items[1], items[2], items[3]]}
                            emptyMessageElement={emptyMessageElement}
                            onItemClick={onItemClick}
                            onItemDelete={onItemDelete}
                        />
                        <ContentDivider />
                    </ConfirmDialogBase>
                </Wrapper>
            </div>
        </>
    );
}

function ManagementDialogCompositionLoadingExample() {
    const isLoading = true;

    return (
        <div className="library-component">
            <div className="screenshot-target">
                <h4>Management dialog composition example with loading items</h4>
                <Wrapper>
                    <ConfirmDialogBase
                        className="gd-management-dialog s-management-dialog"
                        headline="Management dialog"
                        cancelButtonText="Cancel"
                        onCancel={onCancel}
                        onClose={onClose}
                    >
                        <DialogListHeader
                            title="Items list"
                            buttonTitle="Add"
                            buttonDisabled={isLoading}
                            buttonTooltipText="Button is disabled while list is loading"
                            onButtonClick={onHeaderButtonClick}
                        />
                        <DialogList items={[]} isLoading={isLoading} />
                        <ContentDivider />
                    </ConfirmDialogBase>
                </Wrapper>
            </div>
        </div>
    );
}

export default {
    title: "12 UI Kit/DialogList/ManagementDialogComposition",
};

export const FullFeatured = () => <ManagementDialogCompositionExamples />;
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Loading = () => <ManagementDialogCompositionLoadingExample />;
Loading.parameters = { kind: "loading" };

export const Themed = () => wrapWithTheme(<ManagementDialogCompositionExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
