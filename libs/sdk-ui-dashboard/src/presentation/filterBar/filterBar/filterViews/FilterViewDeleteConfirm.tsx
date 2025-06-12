// (C) 2024 GoodData Corporation

import React, { ReactNode } from "react";
import { ConfirmDialog, Typography } from "@gooddata/sdk-ui-kit";
import { useIntl, FormattedMessage } from "react-intl";
import { IDashboardFilterView } from "@gooddata/sdk-model";

export interface IFilterViewDeleteConfirmProps {
    filterView: IDashboardFilterView;
    onConfirm: () => void;
    onCancel: () => void;
}

export const FilterViewDeleteConfirm: React.FC<IFilterViewDeleteConfirmProps> = ({
    filterView,
    onConfirm,
    onCancel,
}) => {
    const intl = useIntl();
    return (
        <ConfirmDialog
            onSubmit={onConfirm}
            onCancel={onCancel}
            isPositive={false}
            className="gd-filter-view__delete-dialog s-gd-filter-view__delete-dialog"
            headline={intl.formatMessage({ id: "filters.filterViews.delete.title" })}
            submitButtonText={intl.formatMessage({ id: "filters.filterViews.delete.deleteButton" })}
            cancelButtonText={intl.formatMessage({ id: "filters.filterViews.delete.cancelButton" })}
        >
            <Typography tagName="p">
                <FormattedMessage
                    id="filters.filterViews.delete.body"
                    values={{
                        view: filterView.name,
                        b: (chunks: ReactNode) => (
                            <strong className="gd-filter-view__delete-dialog__item">{chunks}</strong>
                        ),
                    }}
                />
            </Typography>
        </ConfirmDialog>
    );
};
