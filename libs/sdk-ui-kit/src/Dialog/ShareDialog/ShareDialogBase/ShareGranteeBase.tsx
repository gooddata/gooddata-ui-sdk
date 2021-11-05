// (C) 2021 GoodData Corporation
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { ConfirmDialogBase } from "../../ConfirmDialogBase";
import { ContentDivider } from "./ContentDivider";
import { ShareGranteeContent } from "./ShareGranteeContent";
import { IShareGranteeBaseProps } from "./types";
import { sortGranteesByName } from "./utils";

/**
 * @internal
 */
export const ShareGranteeBase: React.FC<IShareGranteeBaseProps> = (props) => {
    const { grantees, owner, isDirty, onCancel, onSubmit, onGranteeDelete, onAddGranteeButtonClick } = props;
    const intl = useIntl();

    const granteeList = useMemo(() => {
        return [owner, ...grantees].sort(sortGranteesByName(intl));
    }, [grantees, owner, intl]);

    const dialogLabels = useMemo(() => {
        return {
            headline: intl.formatMessage({ id: "shareDialog.share.grantee.title" }),
            cancelButtonText: intl.formatMessage({ id: "cancel" }),
            submitButtonText: intl.formatMessage({ id: "save" }),
        };
    }, []);

    return (
        <ConfirmDialogBase
            className="gd-share-dialog s-gd-share-grantees"
            displayCloseButton={true}
            isPositive={true}
            isSubmitDisabled={!isDirty}
            headline={dialogLabels.headline}
            cancelButtonText={dialogLabels.cancelButtonText}
            submitButtonText={dialogLabels.submitButtonText}
            onCancel={onCancel}
            onSubmit={onSubmit}
        >
            <ShareGranteeContent
                grantees={granteeList}
                onAddGrantee={onAddGranteeButtonClick}
                onDelete={onGranteeDelete}
            />
            <ContentDivider />
        </ConfirmDialogBase>
    );
};
