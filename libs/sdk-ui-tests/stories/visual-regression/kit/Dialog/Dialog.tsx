// (C) 2007-2020 GoodData Corporation
import React, { PureComponent } from "react";
import { Button, Dialog, ConfirmDialog, ExportDialog } from "@gooddata/sdk-ui-kit";
import { storiesOf } from "@storybook/react";
import { UiKit } from "../../../_infra/storyGroups";
import { withMultipleScreenshots } from "../../../_infra/backstopWrapper";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

class DialogExamples extends PureComponent {
    state = {
        dialogOpen: false,
        confirmDialogOpen: false,
        confirmDialogWithWarningOpen: false,
        exportDialogOpen: false,
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
                {this.state.dialogOpen && this.renderDialogContent()}
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
                {this.state.confirmDialogOpen && this.renderConfirmDialogContent()}
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
                {this.state.confirmDialogWithWarningOpen && this.renderConfirmDialogWithWarningContent()}
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
                {this.state.exportDialogOpen && this.renderExportDialogContent()}
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

                <h4>Confirm dialog with warning</h4>
                {this.renderConfirmDialogWithWarningExample()}

                <h4>Export dialog</h4>
                {this.renderExportDialogExample()}
            </div>
        );
    }
}

storiesOf(`${UiKit}/Dialog`, module).add("full-featured", () => {
    return withMultipleScreenshots(<DialogExamples />, {
        dialog: {
            clickSelector: "#dialog-example button",
            postInteractionWait: 200,
        },
        "confirm-dialog": {
            clickSelector: "#confirm-dialog-example button",
            postInteractionWait: 200,
        },
        "confirm-dialog-with-warning": {
            clickSelector: "#confirm-dialog-with-warning-example button",
            postInteractionWait: 200,
        },
        "export-dialog": {
            clickSelector: "#export-dialog-example button",
            postInteractionWait: 200,
        },
    });
});
