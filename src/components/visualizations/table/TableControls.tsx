// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { InjectedIntlProps, injectIntl } from "react-intl";

import Button from "@gooddata/goodstrap/lib/Button/Button";

export interface ITableControlsProps {
    onMore: () => void;
    onLess: () => void;
    isMoreButtonDisabled?: boolean;
    isMoreButtonVisible?: boolean;
    isLessButtonVisible?: boolean;
}

export class TableControlsClass extends React.Component<ITableControlsProps & InjectedIntlProps> {
    public static defaultProps: Partial<ITableControlsProps> = {
        isMoreButtonDisabled: false,
        isMoreButtonVisible: false,
        isLessButtonVisible: false,
    };

    public render(): JSX.Element {
        return (
            <div className="indigo-button-bar">
                {this.renderMore()}
                {this.renderLess()}
            </div>
        );
    }

    private getMessage(id: string): string {
        return this.props.intl.formatMessage({ id: `visualizations.${id}` });
    }

    private renderMore(): JSX.Element {
        if (!this.props.isMoreButtonVisible || this.props.isMoreButtonDisabled) {
            return null;
        }

        const label: string = this.getMessage("more");

        return (
            <Button
                className="gd-button-secondary gd-button-small"
                onClick={this.props.onMore}
                value={label}
                title={label}
            />
        );
    }

    private renderLess(): JSX.Element {
        if (!this.props.isLessButtonVisible) {
            return null;
        }

        const label: string = this.getMessage("less");

        return (
            <Button
                className="gd-button-small gd-button-link-dimmed"
                onClick={this.props.onLess}
                value={label}
                title={label}
            />
        );
    }
}

export const TableControls = injectIntl(TableControlsClass);
