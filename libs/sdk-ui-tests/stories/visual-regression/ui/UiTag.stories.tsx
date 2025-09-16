// (C) 2025 GoodData Corporation

import { ReactNode } from "react";

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { IUiTagAccessibilityConfig, UiTag, UiTagProps } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../themeWrapper.js";

function Example({ title, children }: { title: string; children: ReactNode }) {
    return (
        <>
            <h4>{title}</h4>
            <div>{children}</div>
        </>
    );
}

// Default aria attributes for the menu
const defaultAriaAttributes: IUiTagAccessibilityConfig = {
    ariaLabel: "Tag label",
    deleteAriaLabel: "Delete",
};

const sx = { width: 300, display: "flex", justifyContent: "flex-start", gap: "10px" };

const defaultProps: UiTagProps = {
    accessibilityConfig: defaultAriaAttributes,
    label: "Tag label",
    onClick: action("onClick"),
    onDelete: action("onDelete"),
    onDeleteKeyDown: action("onDeleteKeyDown"),
};

function UiTagExamples() {
    return (
        <IntlProvider locale="en-US" messages={{}}>
            <div className="library-component screenshot-target">
                <h3>Small tags</h3>
                <Example title="Basic tag, deletable">
                    <div style={sx}>
                        <UiTag variant="solid" isDeletable={true} size="small" {...defaultProps} />
                        <UiTag variant="outlined" isDeletable={true} size="small" {...defaultProps} />
                        <UiTag variant="decorated" isDeletable={true} size="small" {...defaultProps} />
                    </div>
                </Example>
                <Example title="Basic tag, disabled">
                    <div style={sx}>
                        <UiTag
                            variant="solid"
                            isDisabled={true}
                            isDeletable={true}
                            size="small"
                            {...defaultProps}
                        />
                        <UiTag
                            variant="outlined"
                            isDisabled={true}
                            isDeletable={true}
                            size="small"
                            {...defaultProps}
                        />
                        <UiTag
                            variant="decorated"
                            isDisabled={true}
                            isDeletable={true}
                            size="small"
                            {...defaultProps}
                        />
                    </div>
                </Example>
                <Example title="Basic tag">
                    <div style={sx}>
                        <UiTag variant="solid" isDeletable={false} size="small" {...defaultProps} />
                        <UiTag variant="outlined" isDeletable={false} size="small" {...defaultProps} />
                        <UiTag variant="decorated" isDeletable={false} size="small" {...defaultProps} />
                    </div>
                </Example>

                <h3>Large tags</h3>
                <Example title="Basic tag, deletable">
                    <div style={sx}>
                        <UiTag variant="solid" isDeletable={true} size="large" {...defaultProps} />
                        <UiTag variant="outlined" isDeletable={true} size="large" {...defaultProps} />
                        <UiTag variant="decorated" isDeletable={true} size="large" {...defaultProps} />
                    </div>
                </Example>
                <Example title="Basic tag, disabled">
                    <div style={sx}>
                        <UiTag
                            variant="solid"
                            isDisabled={true}
                            isDeletable={true}
                            size="large"
                            {...defaultProps}
                        />
                        <UiTag
                            variant="outlined"
                            isDisabled={true}
                            isDeletable={true}
                            size="large"
                            {...defaultProps}
                        />
                        <UiTag
                            variant="decorated"
                            isDisabled={true}
                            isDeletable={true}
                            size="large"
                            {...defaultProps}
                        />
                    </div>
                </Example>
                <Example title="Basic tag, solid">
                    <div style={sx}>
                        <UiTag variant="solid" isDeletable={false} size="large" {...defaultProps} />
                        <UiTag variant="outlined" isDeletable={false} size="large" {...defaultProps} />
                        <UiTag variant="decorated" isDeletable={false} size="large" {...defaultProps} />
                    </div>
                </Example>

                <h3>Special cases</h3>
                <Example title="Long tag">
                    <div style={{ ...sx, flexWrap: "wrap" }}>
                        <UiTag
                            variant="solid"
                            isDeletable={true}
                            size="small"
                            {...defaultProps}
                            label="This is a long tag label that should be truncated in the UI tag component to fit the available space."
                        />
                        <UiTag
                            variant="solid"
                            isDeletable={true}
                            size="small"
                            {...defaultProps}
                            label="This is a long tag but not so long."
                        />
                        <UiTag
                            variant="solid"
                            isDeletable={true}
                            size="small"
                            {...defaultProps}
                            label="Tag"
                        />
                    </div>
                </Example>
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiTag",
};

export function Default() {
    return <UiTagExamples />;
}
Default.parameters = { kind: "default", screenshot: true };

export const Themed = () => wrapWithTheme(<UiTagExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
