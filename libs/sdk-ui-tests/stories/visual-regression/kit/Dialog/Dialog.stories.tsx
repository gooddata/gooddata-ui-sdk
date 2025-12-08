// (C) 2007-2025 GoodData Corporation

import { ReactElement, memo, useState } from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";
import {
    Button,
    CommunityEditionDialog,
    ConfirmDialog,
    Dialog,
    ExportDialog,
    StylingEditorDialog,
} from "@gooddata/sdk-ui-kit";
import "@gooddata/sdk-ui-kit/styles/css/main.css";

import {
    INeobackstopConfig,
    INeobackstopScenarioConfig,
    IStoryParameters,
} from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import "./styles.scss";

const DialogExamples = memo(function DialogExamples() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmDialogWithNoSubmitButtonOpen, setConfirmDialogWithNoSubmitButtonOpen] = useState(false);
    const [confirmDialogWithWarningOpen, setConfirmDialogWithWarningOpen] = useState(false);
    const [confirmDialogWithProgress, setConfirmDialogWithProgress] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [communityDialogOpen, setCommunityDialogOpen] = useState(false);
    const [stylingEditorOpen, setStylingEditorOpen] = useState(false);

    const onExportCancel = () => {
        setExportDialogOpen(false);
    };

    const onExportSubmit = (values: any) => {
        console.log("values: ", values); // eslint-disable-line no-console
        setExportDialogOpen(false);
    };

    const renderDialogContent = (): ReactElement => {
        return (
            <Dialog
                onCancel={() => {
                    setDialogOpen(false);
                }}
                onSubmit={() => {
                    setDialogOpen(false);
                }}
                displayCloseButton
                accessibilityConfig={{ titleElementId: "dialog-title" }}
            >
                <div style={{ padding: "20px" }}>
                    <div className="gd-dialog-header">
                        <h3 id={"dialog-title"}>Custom Dialog</h3>
                    </div>
                    <p>A beautiful custom dialog!</p>
                </div>
            </Dialog>
        );
    };

    const renderConfirmDialogContent = (): ReactElement => {
        return (
            <ConfirmDialog
                onCancel={() => {
                    setConfirmDialogOpen(false);
                }}
                onSubmit={() => {
                    setConfirmDialogOpen(false);
                }}
                isPositive={false}
                headline="Discard changes"
                cancelButtonText="Cancel"
                submitButtonText="Discard changes"
            >
                <p>All your unsaved changes will be lost. Is this OK?</p>
            </ConfirmDialog>
        );
    };

    const renderConfirmDialogWithNoSubmitButtonContent = (): ReactElement => {
        return (
            <ConfirmDialog
                onCancel={() => {
                    setConfirmDialogWithNoSubmitButtonOpen(false);
                }}
                isPositive={false}
                headline="Click cancel button please"
                cancelButtonText="Cancel"
            >
                <p>This dialog does nothing</p>
            </ConfirmDialog>
        );
    };

    const renderConfirmDialogWithProgressIndicator = (): ReactElement => {
        return (
            <ConfirmDialog
                onCancel={() => {
                    setConfirmDialogWithProgress(false);
                }}
                onSubmit={() => {
                    setConfirmDialogWithProgress(false);
                }}
                showProgressIndicator
                headline="Progress indicator"
                cancelButtonText="Cancel"
                submitButtonText="Save"
            >
                <p>Progress indicators inform users about the status of ongoing processes...</p>
            </ConfirmDialog>
        );
    };

    const renderConfirmDialogWithWarningContent = (): ReactElement => {
        return (
            <ConfirmDialog
                onCancel={() => {
                    setConfirmDialogWithWarningOpen(false);
                }}
                onSubmit={() => {
                    setConfirmDialogWithWarningOpen(false);
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
    };

    const renderExportDialogContent = (): ReactElement => {
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
                onCancel={onExportCancel}
                onSubmit={onExportSubmit}
            />
        );
    };

    const renderCommunityEditionDialogContent = (): ReactElement => {
        return (
            <IntlWrapper>
                <CommunityEditionDialog
                    onClose={() => {
                        setCommunityDialogOpen(false);
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
            </IntlWrapper>
        );
    };

    const renderStylingEditorDialogContent = (): ReactElement => {
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
                onSubmit={() => setStylingEditorOpen(false)}
                onCancel={() => setStylingEditorOpen(false)}
                onClose={() => setStylingEditorOpen(false)}
            />
        );
    };

    const renderDialogExample = (): ReactElement => {
        return (
            <div id="dialog-example">
                <Button
                    value="Open dialog"
                    className="gd-button-positive s-dialog-button"
                    onClick={() => {
                        setDialogOpen(!dialogOpen);
                    }}
                />
                {dialogOpen ? renderDialogContent() : null}
            </div>
        );
    };

    const renderConfirmDialogExample = (): ReactElement => {
        return (
            <div id="confirm-dialog-example">
                <Button
                    value="Open confirm dialog"
                    className="gd-button-positive s-confirm-dialog-button"
                    onClick={() => {
                        setConfirmDialogOpen(!confirmDialogOpen);
                    }}
                />
                {confirmDialogOpen ? renderConfirmDialogContent() : null}
            </div>
        );
    };

    const renderConfirmDialogWithNoSubmitButtonExample = (): ReactElement => {
        return (
            <div id="confirm-dialog-with-no-submit-button-example">
                <Button
                    value="Open confirm dialog with no submit button"
                    className="gd-button-positive s-confirm-dialog-with-no-submit-button"
                    onClick={() => {
                        setConfirmDialogWithNoSubmitButtonOpen(!confirmDialogWithNoSubmitButtonOpen);
                    }}
                />
                {confirmDialogWithNoSubmitButtonOpen ? renderConfirmDialogWithNoSubmitButtonContent() : null}
            </div>
        );
    };

    const renderConfirmDialogWithWithProgressExample = (): ReactElement => {
        return (
            <div id="confirm-dialog-with-progress-example">
                <Button
                    value="Open confirm dialog with progress example"
                    className="gd-button-positive s-confirm-dialog-with-warning-button"
                    onClick={() => {
                        setConfirmDialogWithProgress(!confirmDialogWithProgress);
                    }}
                />
                {confirmDialogWithProgress ? renderConfirmDialogWithProgressIndicator() : null}
            </div>
        );
    };

    const renderConfirmDialogWithWarningExample = (): ReactElement => {
        return (
            <div id="confirm-dialog-with-warning-example">
                <Button
                    value="Open confirm dialog with warning"
                    className="gd-button-positive s-confirm-dialog-with-warning-button"
                    onClick={() => {
                        setConfirmDialogWithWarningOpen(!confirmDialogWithWarningOpen);
                    }}
                />
                {confirmDialogWithWarningOpen ? renderConfirmDialogWithWarningContent() : null}
            </div>
        );
    };

    const renderExportDialogExample = (): ReactElement => {
        return (
            <div id="export-dialog-example">
                <Button
                    value="Open export dialog"
                    className="gd-button-positive s-export-dialog-button"
                    onClick={() => {
                        setExportDialogOpen(!exportDialogOpen);
                    }}
                />
                {exportDialogOpen ? renderExportDialogContent() : null}
            </div>
        );
    };

    const renderCommunityEditionDialogExample = (): ReactElement => {
        return (
            <div id="community-dialog-example">
                <Button
                    value="Open community edition dialog"
                    className="gd-button-positive s-community-dialog-button"
                    onClick={() => {
                        setCommunityDialogOpen(!communityDialogOpen);
                    }}
                />
                {communityDialogOpen ? renderCommunityEditionDialogContent() : null}
            </div>
        );
    };

    const renderStylingEditorDialog = (): ReactElement => {
        return (
            <div id="styling-editor-dialog-example">
                <Button
                    value="Open styling editor dialog"
                    className="gd-button-positive s-styling-editor-dialog-button"
                    onClick={() => {
                        setStylingEditorOpen(!stylingEditorOpen);
                    }}
                />
                {stylingEditorOpen ? renderStylingEditorDialogContent() : null}
            </div>
        );
    };

    return (
        <div className="library-component screenshot-target">
            <h4>Dialog</h4>
            {renderDialogExample()}

            <h4>Confirm dialog</h4>
            {renderConfirmDialogExample()}

            <h4>Confirm dialog with no submit button</h4>
            {renderConfirmDialogWithNoSubmitButtonExample()}

            <h4>Confirm dialog with warning</h4>
            {renderConfirmDialogWithWarningExample()}

            <h4>Confirm dialog with progress indicator</h4>
            {renderConfirmDialogWithWithProgressExample()}

            <h4>Export dialog</h4>
            {renderExportDialogExample()}

            <h4>Community edition dialog</h4>
            {renderCommunityEditionDialogExample()}

            <h4>Styling editor dialog</h4>
            {renderStylingEditorDialog()}
        </div>
    );
});

const confirmDialogWithWarningProps = {
    clickSelector: "#confirm-dialog-with-warning-example button",
    postInteractionWait: 200,
};

const confirmDialogWithProgressProps = {
    clickSelector: "#confirm-dialog-with-progress-example button",
    postInteractionWait: 200,
    misMatchThreshold: 0.05,
};

const exportDialogProps = {
    clickSelector: "#export-dialog-example button",
    postInteractionWait: 200,
};

// flaky, removed
// const communityEditionDialogProps = {
//     clickSelector: "#community-dialog-example button",
//     postInteractionWait: 200,
// };

const stylingEditorDialogProps: INeobackstopScenarioConfig = {
    clickSelector: "#styling-editor-dialog-example button",
    postInteractionWait: 200,
};

const screenshotProps: INeobackstopConfig = {
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
    // "confirm-dialog-with-warning": confirmDialogWithWarningProps,
    "confirm-dialog-with-progress": confirmDialogWithProgressProps,
    "export-dialog": exportDialogProps,
    // "community-edition-dialog": communityEditionDialogProps,
    "styling-editor-dialog": stylingEditorDialogProps,
};

const screenshotPropsThemed: INeobackstopConfig = {
    "confirm-dialog-with-warning": confirmDialogWithWarningProps,
    // "export-dialog": exportDialogProps,
    "styling-editor-dialog": stylingEditorDialogProps,
};

// eslint-disable-next-line no-restricted-exports
export default {
    title: "12 UI Kit/Dialog",
};

export function FullFeatured() {
    return <DialogExamples />;
}
FullFeatured.parameters = { kind: "full-featured", screenshots: screenshotProps } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<DialogExamples />);
Themed.parameters = { kind: "themed", screenshots: screenshotPropsThemed } satisfies IStoryParameters;
