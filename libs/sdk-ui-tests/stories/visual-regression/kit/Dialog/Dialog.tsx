// (C) 2007-2020 GoodData Corporation
import React, { PureComponent } from "react";
import {
    Button,
    Dialog,
    ConfirmDialog,
    ExportDialog,
    CommunityEditionDialog,
    StylingEditorDialog,
} from "@gooddata/sdk-ui-kit";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

class DialogExamples extends PureComponent {
    state = {
        dialogOpen: false,
        confirmDialogOpen: false,
        confirmDialogWithNoSubmitButtonOpen: false,
        confirmDialogWithWarningOpen: false,
        confirmDialogWithProgress: false,
        exportDialogOpen: false,
        communityDialogOpen: false,
        stylingEditorOpen: false,
    };

    private onExportCancel = () => {
        this.setState({ exportDialogOpen: false });
    };

    private onExportSubmit = (values: any) => {
        console.log("values: ", values); // eslint-disable-line no-console
        this.setState({ exportDialogOpen: false });
    };

    public renderDialogContent(): JSX.Element {
        return (
            <Dialog
                onCancel={() => {
                    this.setState({ dialogOpen: false });
                }}
                onSubmit={() => {
                    this.setState({ dialogOpen: false });
                }}
                displayCloseButton={true}
            >
                <div style={{ padding: "20px" }}>
                    <div className="gd-dialog-header">
                        <h3>Custom Dialog</h3>
                    </div>
                    <p>A beautiful custom dialog!</p>
                </div>
            </Dialog>
        );
    }

    public renderConfirmDialogContent(): JSX.Element {
        return (
            <ConfirmDialog
                onCancel={() => {
                    this.setState({ confirmDialogOpen: false });
                }}
                onSubmit={() => {
                    this.setState({ confirmDialogOpen: false });
                }}
                isPositive={false}
                headline="Discard changes"
                cancelButtonText="Cancel"
                submitButtonText="Discard changes"
            >
                <p>All your unsaved changes will be lost. Is this OK?</p>
            </ConfirmDialog>
        );
    }

    public renderConfirmDialogWithNoSubmitButtonContent(): JSX.Element {
        return (
            <ConfirmDialog
                onCancel={() => {
                    this.setState({ confirmDialogWithNoSubmitButtonOpen: false });
                }}
                isPositive={false}
                headline="Click cancel button please"
                cancelButtonText="Cancel"
            >
                <p>This dialog does nothing</p>
            </ConfirmDialog>
        );
    }

    public renderConfirmDialogWithProgressIndicator(): JSX.Element {
        return (
            <ConfirmDialog
                onCancel={() => {
                    this.setState({ confirmDialogWithProgress: false });
                }}
                onSubmit={() => {
                    this.setState({ confirmDialogWithProgress: false });
                }}
                showProgressIndicator={true}
                headline="Progress indicator"
                cancelButtonText="Cancel"
                submitButtonText="Save"
            >
                <p>Progress indicators inform users about the status of ongoing processes...</p>
            </ConfirmDialog>
        );
    }

    public renderConfirmDialogWithWarningContent(): JSX.Element {
        return (
            <ConfirmDialog
                onCancel={() => {
                    this.setState({ confirmDialogWithWarningOpen: false });
                }}
                onSubmit={() => {
                    this.setState({ confirmDialogWithWarningOpen: false });
                }}
                isPositive={false}
                headline="Discard changes"
                cancelButtonText="Cancel"
                submitButtonText="Discard changes"
                warning="Rocket will blow up!"
            >
                <p>All your unsaved changes will be lost. Is this OK?</p>
            </ConfirmDialog>
        );
    }

    public renderExportDialogContent(): JSX.Element {
        return (
            <ExportDialog
                displayCloseButton
                isSubmitDisabled={false}
                headline="Export to XLSX"
                cancelButtonText="Cancel"
                submitButtonText="Export"
                isPositive
                filterContextText="Include applied filters"
                filterContextTitle="INSIGHT CONTEXT"
                filterContextVisible
                includeFilterContext
                mergeHeaders
                mergeHeadersDisabled={false}
                mergeHeadersText="Keep attribute cells merged"
                mergeHeadersTitle="CELLS"
                onCancel={this.onExportCancel}
                onSubmit={this.onExportSubmit}
            />
        );
    }

    public renderCommunityEditionDialogContent(): JSX.Element {
        return (
            <CommunityEditionDialog
                onClose={() => {
                    this.setState({ communityDialogOpen: false });
                }}
                headerText="About GoodData.CN community edition"
                infoText="The community edition is meant for evaluation purposes only."
                copyrightText="Copyright (c) 2021 GoodData Corporation"
                closeButtonText="Close"
                links={[
                    {
                        text: "Licence information",
                        uri: "#licence",
                    },
                    {
                        text: "Terms of use",
                        uri: "#tou",
                    },
                ]}
            />
        );
    }

    public renderStylingEditorDialogContent(): JSX.Element {
        const theme = (color: string) => {
            return {
                palette: {
                    primary: {
                        base: color,
                    },
                    complementary: {
                        c0: "#122330",
                        c9: "#F0F8FF",
                    },
                },
            };
        };

        return (
            <StylingEditorDialog
                title="Styling editor"
                link={{
                    text: "Documentation link.",
                    url: "#",
                }}
                locale="en-US"
                tooltip="Tooltip to describe examples usage."
                stylingItem={{
                    name: "Red theme",
                    content: theme("red"),
                }}
                examples={[
                    {
                        name: "Green theme",
                        content: theme("green"),
                    },
                    {
                        name: "Blue theme",
                        content: theme("blue"),
                    },
                ]}
                exampleToColorPreview={() => [
                    "#313441",
                    "#FFFFFF",
                    "#14B2E2",
                    "#464E56",
                    "#94A1AD",
                    "#E2E7EC",
                ]}
                onSubmit={() => this.setState({ stylingEditorOpen: false })}
                onCancel={() => this.setState({ stylingEditorOpen: false })}
                onClose={() => this.setState({ stylingEditorOpen: false })}
            />
        );
    }

    public renderDialogExample(): JSX.Element {
        return (
            <div id="dialog-example">
                <Button
                    value="Open dialog"
                    className="gd-button-positive s-dialog-button"
                    onClick={() => {
                        this.setState({ dialogOpen: !this.state.dialogOpen });
                    }}
                />
                {this.state.dialogOpen ? this.renderDialogContent() : null}
            </div>
        );
    }

    public renderConfirmDialogExample(): JSX.Element {
        return (
            <div id="confirm-dialog-example">
                <Button
                    value="Open confirm dialog"
                    className="gd-button-positive s-confirm-dialog-button"
                    onClick={() => {
                        this.setState({ confirmDialogOpen: !this.state.confirmDialogOpen });
                    }}
                />
                {this.state.confirmDialogOpen ? this.renderConfirmDialogContent() : null}
            </div>
        );
    }

    public renderConfirmDialogWithNoSubmitButtonExample(): JSX.Element {
        return (
            <div id="confirm-dialog-with-no-submit-button-example">
                <Button
                    value="Open confirm dialog with no submit button"
                    className="gd-button-positive s-confirm-dialog-with-no-submit-button"
                    onClick={() => {
                        this.setState({
                            confirmDialogWithNoSubmitButtonOpen:
                                !this.state.confirmDialogWithNoSubmitButtonOpen,
                        });
                    }}
                />
                {this.state.confirmDialogWithNoSubmitButtonOpen
                    ? this.renderConfirmDialogWithNoSubmitButtonContent()
                    : null}
            </div>
        );
    }

    public renderConfirmDialogWithWithProgressExample(): JSX.Element {
        return (
            <div id="confirm-dialog-with-progress-example">
                <Button
                    value="Open confirm dialog with progress example"
                    className="gd-button-positive s-confirm-dialog-with-warning-button"
                    onClick={() => {
                        this.setState({
                            confirmDialogWithProgress: !this.state.confirmDialogWithProgress,
                        });
                    }}
                />
                {this.state.confirmDialogWithProgress
                    ? this.renderConfirmDialogWithProgressIndicator()
                    : null}
            </div>
        );
    }

    public renderConfirmDialogWithWarningExample(): JSX.Element {
        return (
            <div id="confirm-dialog-with-warning-example">
                <Button
                    value="Open confirm dialog with warning"
                    className="gd-button-positive s-confirm-dialog-with-warning-button"
                    onClick={() => {
                        this.setState({
                            confirmDialogWithWarningOpen: !this.state.confirmDialogWithWarningOpen,
                        });
                    }}
                />
                {this.state.confirmDialogWithWarningOpen
                    ? this.renderConfirmDialogWithWarningContent()
                    : null}
            </div>
        );
    }

    public renderExportDialogExample(): JSX.Element {
        return (
            <div id="export-dialog-example">
                <Button
                    value="Open export dialog"
                    className="gd-button-positive s-export-dialog-button"
                    onClick={() => {
                        this.setState({ exportDialogOpen: !this.state.exportDialogOpen });
                    }}
                />
                {this.state.exportDialogOpen ? this.renderExportDialogContent() : null}
            </div>
        );
    }

    public renderCommunityEditionDialogExample(): JSX.Element {
        return (
            <div id="community-dialog-example">
                <Button
                    value="Open community edition dialog"
                    className="gd-button-positive s-community-dialog-button"
                    onClick={() => {
                        this.setState({ communityDialogOpen: !this.state.communityDialogOpen });
                    }}
                />
                {this.state.communityDialogOpen ? this.renderCommunityEditionDialogContent() : null}
            </div>
        );
    }

    public renderStylingEditorDialog(): JSX.Element {
        return (
            <div id="styling-editor-dialog-example">
                <Button
                    value="Open styling editor dialog"
                    className="gd-button-positive s-styling-editor-dialog-button"
                    onClick={() => {
                        this.setState({ stylingEditorOpen: !this.state.stylingEditorOpen });
                    }}
                />
                {this.state.stylingEditorOpen ? this.renderStylingEditorDialogContent() : null}
            </div>
        );
    }

    public render(): JSX.Element {
        return (
            <div className="library-component screenshot-target">
                <h4>Dialog</h4>
                {this.renderDialogExample()}

                <h4>Confirm dialog</h4>
                {this.renderConfirmDialogExample()}

                <h4>Confirm dialog with no submit button</h4>
                {this.renderConfirmDialogWithNoSubmitButtonExample()}

                <h4>Confirm dialog with warning</h4>
                {this.renderConfirmDialogWithWarningExample()}

                <h4>Confirm dialog with progress indicator</h4>
                {this.renderConfirmDialogWithWithProgressExample()}

                <h4>Export dialog</h4>
                {this.renderExportDialogExample()}

                <h4>Community edition dialog</h4>
                {this.renderCommunityEditionDialogExample()}

                <h4>Styling editor dialog</h4>
                {this.renderStylingEditorDialog()}
            </div>
        );
    }
}

const confirmDialogWithWarningProps = {
    clickSelector: "#confirm-dialog-with-warning-example button",
    postInteractionWait: 200,
};

const confirmDialogWithProgressProps = {
    clickSelector: "#confirm-dialog-with-progress-example button",
    postInteractionWait: 200,
};

const exportDialogProps = {
    clickSelector: "#export-dialog-example button",
    postInteractionWait: 200,
};

const communityEditionDialogProps = {
    clickSelector: "#community-dialog-example button",
    postInteractionWait: 200,
};

const stylingEditorDialogProps = {
    clickSelector: "#styling-editor-dialog-example button",
    postInteractionWait: 200,
};

const screenshotProps = {
    dialog: {
        clickSelector: "#dialog-example button",
        postInteractionWait: 200,
    },
    "confirm-dialog": {
        clickSelector: "#confirm-dialog-example button",
        postInteractionWait: 200,
    },
    "confirm-dialog-with-no-submit-button": {
        clickSelector: "#confirm-dialog-with-no-submit-button-example button",
        postInteractionWait: 200,
    },
    "confirm-dialog-with-warning": confirmDialogWithWarningProps,
    "confirm-dialog-with-progress": confirmDialogWithProgressProps,
    "export-dialog": exportDialogProps,
    "community-edition-dialog": communityEditionDialogProps,
    "styling-editor-dialog": stylingEditorDialogProps,
};

const screenshotPropsThemed = {
    "confirm-dialog-with-warning": confirmDialogWithWarningProps,
    "export-dialog": exportDialogProps,
    "styling-editor-dialog": stylingEditorDialogProps,
};

storiesOf(`${UiKit}/Dialog`)
    .add("full-featured", () => <DialogExamples />, { screenshots: screenshotProps })
    .add("themed", () => wrapWithTheme(<DialogExamples />), { screenshots: screenshotPropsThemed });
