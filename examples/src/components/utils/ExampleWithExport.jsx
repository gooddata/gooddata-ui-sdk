// (C) 2007-2018 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React from "react";
import assign from "lodash/assign";
import get from "lodash/get";
import ExportDialog from "@gooddata/goodstrap/lib/Dialog/ExportDialog";
import PropTypes from "prop-types";

const DOWNLOADER_ID = "downloader";

export class ExampleWithExport extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showExportDialog: false,
            errorMessage: null,
        };

        this.onExportReady = this.onExportReady.bind(this);
        this.exportToCSV = this.exportToCSV.bind(this);
        this.exportToXLSX = this.exportToXLSX.bind(this);
        this.exportWithCustomName = this.exportWithCustomName.bind(this);
        this.exportWithDialog = this.exportWithDialog.bind(this);
        this.exportWithMergeHeaders = this.exportWithMergeHeaders.bind(this);
        this.doExport = this.doExport.bind(this);
        this.getExportDialog = this.getExportDialog.bind(this);
        this.exportDialogCancel = this.exportDialogCancel.bind(this);
    }

    onExportReady(exportResult) {
        this.exportResult = exportResult;
    }

    getExportDialog() {
        return (
            <ExportDialog
                headline="Export to XLSX"
                cancelButtonText="Cancel"
                submitButtonText="Export"
                isPositive
                seleniumClass="s-dialog"
                mergeHeaders
                mergeHeadersDisabled={false}
                mergeHeadersText="Keep attribute cells merged"
                mergeHeadersTitle="CELLS"
                onCancel={this.exportDialogCancel}
                onSubmit={this.exportWithMergeHeaders}
            />
        );
    }

    downloadFile(uri) {
        let anchor = document.getElementById(DOWNLOADER_ID);
        if (!anchor) {
            anchor = document.createElement("a");
            anchor.id = DOWNLOADER_ID;
            document.body.appendChild(anchor);
        }
        anchor.href = uri;
        anchor.download = uri;
        anchor.click();
    }

    exportDialogCancel() {
        this.setState({ showExportDialog: false });
    }

    exportToCSV() {
        this.doExport({});
    }

    exportToXLSX() {
        this.doExport({ format: "xlsx" });
    }

    exportWithCustomName() {
        this.doExport({ title: "CustomName" });
    }

    exportWithDialog() {
        this.setState({ showExportDialog: true });
    }

    exportWithMergeHeaders(exportConfig) {
        this.setState({ showExportDialog: false });
        this.doExport(assign({ format: "xlsx", title: "CustomName" }, exportConfig));
    }

    async doExport(exportConfig) {
        try {
            const result = await this.exportResult(exportConfig);
            this.setState({ errorMessage: null });
            this.downloadFile(result.uri);
        } catch (error) {
            let errorMessage = error.message;
            if (error.responseBody) {
                errorMessage = get(JSON.parse(error.responseBody), "error.message");
            }
            this.setState({ errorMessage });
        }
    }

    render() {
        const { errorMessage, showExportDialog } = this.state;

        let errorComponent;
        if (errorMessage) {
            errorComponent = <div style={{ color: "red", marginTop: 5 }}>{errorMessage}</div>;
        }

        let exportDialog;
        if (showExportDialog) {
            exportDialog = this.getExportDialog();
        }

        return (
            <div style={{ height: 367 }}>
                {this.props.children(this.onExportReady)}
                <div style={{ marginTop: 15 }}>
                    <button className="button button-secondary" onClick={this.exportToCSV}>
                        Export CSV
                    </button>
                    <button className="button button-secondary" onClick={this.exportToXLSX}>
                        Export XLSX
                    </button>
                    <button className="button button-secondary" onClick={this.exportWithCustomName}>
                        Export with custom name CustomName
                    </button>
                    <button className="button button-secondary" onClick={this.exportWithDialog}>
                        Export using Export Dialog
                    </button>
                </div>
                {errorComponent}
                {exportDialog}
            </div>
        );
    }
}

ExampleWithExport.propTypes = {
    children: PropTypes.func.isRequired,
};

export default ExampleWithExport;
