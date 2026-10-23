// (C) 2025-2026 GoodData Corporation

import { type ReactElement, memo, useCallback, useMemo } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { type IUiTagDef, UiTags } from "@gooddata/sdk-ui-kit";

import { type DefaultTheme, makeStyles } from "../../../shared/theme/index.js";
import { FormField } from "../data.js";
import { useMetricFormField } from "../hooks/useMetricFormField.js";
import { useMetricFormStatus } from "../hooks/useMetricFormStatus.js";

const useStyles = makeStyles()((theme: DefaultTheme) => ({
    root: {
        width: "100%",
        display: "flex",
        alignItems: "center",
    },
    label: {
        fontSize: "14px",
        color: theme.globals.colors.description,
    },
    labelWithTags: {
        marginRight: "8px",
    },
    labelWithoutTags: {
        marginRight: "4px",
    },
}));

export interface IMetricTagsFieldProps {
    className?: string;
}

function MetricTagsFieldComponent({ className }: IMetricTagsFieldProps): ReactElement | null {
    const { classes, cx } = useStyles();
    const intl = useIntl();
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const { isLocked } = useMetricFormStatus();
    const { value: tags = [], onChange, isReadOnly } = useMetricFormField(FormField.tags);

    // Fetch available tags from the backend
    const catalogTags = useCancelablePromise<{ tags: string[] }, Error>(
        {
            promise: () => backend.workspace(workspace).genAI().getAnalyticsCatalog().getTags(),
            onError: (error) => console.error(error),
        },
        [backend, workspace],
    );

    const itemTags = useMemo(() => {
        const tagsArray = tags || [];
        return tagsArray.map((tag: string) => ({
            id: tag,
            label: tag,
            isDeletable: !isLocked && !isReadOnly,
        }));
    }, [tags, isLocked, isReadOnly]);

    const tagOptions = useMemo(
        () => (catalogTags.result?.tags || []).map((tag) => ({ id: tag, label: tag })),
        [catalogTags.result?.tags],
    );

    const canEdit = !isLocked && !isReadOnly;
    const hasTags = tags?.length > 0;

    const handleTagAdd = useCallback(
        (tag: IUiTagDef) => {
            const newTags = [...new Set([...(tags || []), tag.label])];
            onChange(newTags);
        },
        [tags, onChange],
    );

    const handleTagRemove = useCallback(
        (tag: IUiTagDef) => {
            const newTags = (tags || []).filter((t: string) => t !== tag.label);
            onChange(newTags);
        },
        [tags, onChange],
    );

    return (
        <div className={cx(classes.root, className, "s-edit_dialog_tags")}>
            <div className={cx(classes.label, hasTags ? classes.labelWithTags : classes.labelWithoutTags)}>
                <FormattedMessage id="metricComponent.tags.label" />
            </div>
            <UiTags
                tags={itemTags}
                tagOptions={tagOptions}
                canCreateTag={canEdit}
                canDeleteTags={canEdit}
                mode="multi-line"
                onTagAdd={handleTagAdd}
                onTagRemove={handleTagRemove}
                addLabel={intl.formatMessage({ id: "metricComponent.tags.manager.label.addLabel" })}
                nameLabel={intl.formatMessage({ id: "metricComponent.tags.manager.label.nameLabel" })}
                cancelLabel={intl.formatMessage({ id: "metricComponent.tags.manager.label.cancelLabel" })}
                saveLabel={intl.formatMessage({ id: "metricComponent.tags.manager.label.saveLabel" })}
                removeLabel={intl.formatMessage({ id: "metricComponent.tags.manager.label.removeLabel" })}
                moreLabel={intl.formatMessage({ id: "metricComponent.tags.manager.label.more" })}
                noTagsLabel={intl.formatMessage({ id: "metricComponent.tags.manager.label.noTags" })}
                closeLabel={intl.formatMessage({ id: "metricComponent.tags.manager.label.close" })}
            />
        </div>
    );
}

export const MetricTagsField = memo(MetricTagsFieldComponent);
