// (C) 2020-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { stringUtils } from "@gooddata/util";
import { ISeparators } from "@gooddata/sdk-ui";

import PreviewRows from "../shared/PreviewRows.js";
import { IFormatTemplate } from "../../typings.js";
import { Bubble } from "../../../Bubble/index.js";
import { Typography } from "../../../Typography/index.js";

interface ITemplateDropdownItemProps {
    template: IFormatTemplate;
    separators?: ISeparators;
    onClick: (template: IFormatTemplate) => void;
}

interface ITemplateDropdownItemState {
    displayHelp: boolean;
}

function templateDropdownItemId(template: IFormatTemplate): string {
    return `gd-format-preset-template-${template.localIdentifier}`;
}

export default class DropdownItem extends React.Component<
    ITemplateDropdownItemProps,
    ITemplateDropdownItemState
> {
    public state = {
        displayHelp: false,
    };

    public render() {
        const { template, separators } = this.props;
        const { displayHelp } = this.state;
        return (
            <>
                <div
                    id={templateDropdownItemId(template)}
                    className={`gd-list-item gd-format-preset gd-format-template s-measure-format-template-${stringUtils.simplifyText(
                        template.name,
                    )}`}
                    onClick={this.onClick}
                >
                    <span title={template.name} className="gd-format-preset-name gd-list-item-shortened">
                        {template.name}
                    </span>
                    <div
                        className="gd-format-template-help gd-icon-circle-question s-measure-format-template-help-toggle-icon"
                        onMouseEnter={this.toggleHelp}
                        onMouseLeave={this.toggleHelp}
                    />
                </div>
                {displayHelp ? (
                    <Bubble
                        alignTo={`#${templateDropdownItemId(template)}`}
                        className={`gd-measure-format-template-preview-bubble bubble-light s-measure-format-template-help-bubble-${stringUtils.simplifyText(
                            template.name,
                        )}`}
                        alignPoints={[{ align: "cr cl" }, { align: "cr bl" }, { align: "cr tl" }]}
                    >
                        <Typography className="gd-measure-format-template-preview-bubble-title" tagName="h3">
                            {template.name}
                        </Typography>
                        <div
                            className={`gd-measure-format-template-preview-bubble-subtitle s-measure-format-template-help-preview-${stringUtils.simplifyText(
                                template.name,
                            )}`}
                        >
                            <FormattedMessage id="measureNumberCustomFormatDialog.template.preview.title" />
                        </div>
                        <PreviewRows
                            previewNumbers={[
                                -1234567.891, -1234.567, -1.234, 0, 1.234, 1234.567, 1234567.891,
                            ]}
                            format={template.format}
                            separators={separators}
                        />
                    </Bubble>
                ) : null}
            </>
        );
    }

    private onClick = () => {
        this.props.onClick(this.props.template);
    };

    private toggleHelp = () => {
        this.setState((state) => ({ displayHelp: !state.displayHelp }));
    };
}
