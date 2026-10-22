// (C) 2023-2026 GoodData Corporation

import { useEffect, useMemo, useState } from "react";

import stringify from "json-stable-stringify";

import { type IUserLocalizationSettings, type LocalizationSettingType } from "@gooddata/sdk-backend-spi";
import { type IUser, type IUserGroup } from "@gooddata/sdk-model";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";
import { useOrganizationId } from "../OrganizationIdContext.js";
import { type TelemetryEvent, useTelemetry } from "../TelemetryContext.js";

import { changedLanguageSettings } from "./userLanguages.js";

const LANGUAGE_SAVED_EVENTS: Record<LocalizationSettingType, TelemetryEvent> = {
    LOCALE: "user-display-language-saved",
    METADATA_LOCALE: "user-metadata-language-saved",
    DATA_LOCALE: "user-data-language-saved",
};

export const useUserDetails = (
    user: IUser | undefined,
    isAdmin: boolean,
    onSubmit: (user: IUser, isAdmin: boolean, languages?: IUserLocalizationSettings) => void,
    onCancel: () => void,
    removeAdminGroup: () => Promise<void>,
    isSystemAccountFilteringEnabled = false,
    languages?: IUserLocalizationSettings,
    onLanguagesSaveFailed?: () => void,
) => {
    const { addSuccess, addError } = useToastMessage();
    const [updatedUser, setUpdatedUser] = useState(user);
    const [updatedLanguages, setUpdatedLanguages] = useState(languages);
    const [isUpdatedAdmin, setUpdatedAdmin] = useState(isAdmin);
    const backend = useBackendStrict();
    const organizationId = useOrganizationId();
    const [isProcessing, setIsProcessing] = useState(false);
    const trackEvent = useTelemetry();

    // update user group from props (when dialog is opened directly in edit mode and we wait for fetch result)
    useEffect(() => {
        setUpdatedUser(user);
    }, [user]);

    useEffect(() => {
        setUpdatedLanguages((current) => current ?? languages);
    }, [languages]);

    const languageChanges = useMemo(
        () => (languages && updatedLanguages ? changedLanguageSettings(languages, updatedLanguages) : []),
        [languages, updatedLanguages],
    );

    const onChange = (user: IUser, isAdmin: boolean) => {
        setUpdatedUser(user);
        setUpdatedAdmin(isAdmin);
    };

    const onSave = () => {
        if (!updatedUser) {
            return;
        }
        const updateAdmin = isAdmin !== isUpdatedAdmin;
        const { firstName, lastName } = updatedUser;
        const sanitizedUser: IUser = {
            ...updatedUser,
            fullName: firstName && lastName ? `${firstName} ${lastName}` : undefined,
            ...(isSystemAccountFilteringEnabled ? {} : { systemAccount: undefined }),
        };

        const isLanguageOnlySave =
            stringify(user) === stringify(updatedUser) && !updateAdmin && languageChanges.length > 0;

        setIsProcessing(true);

        Promise.all([
            // update user details
            isLanguageOnlySave
                ? Promise.resolve()
                : backend.organization(organizationId).users().updateUser(sanitizedUser),
            // grant or remove org manage rights if they are supposed to change
            updateAdmin
                ? backend
                      .organization(organizationId)
                      .permissions()
                      .updateOrganizationPermissions([
                          {
                              assigneeIdentifier: {
                                  id: sanitizedUser.login,
                                  type: "user",
                              },
                              permissions: isUpdatedAdmin ? ["MANAGE"] : [],
                          },
                      ])
                : Promise.resolve(),
            // remove admin group if org manage rights must be removed and user is its member
            updateAdmin && !isUpdatedAdmin ? removeAdminGroup() : Promise.resolve(),
            ...languageChanges.map(([type, value]) =>
                backend
                    .organization(organizationId)
                    .users()
                    .setUserLocalizationSetting(sanitizedUser.login, type, value)
                    .then(() => trackEvent(LANGUAGE_SAVED_EVENTS[type])),
            ),
        ])
            .then(() => {
                addSuccess(messages.userDetailsUpdatedSuccess);
                trackEvent("user-detail-updated");
                onSubmit(sanitizedUser, isUpdatedAdmin, updatedLanguages);
                onCancel();
            })
            .catch((error) => {
                console.error("Change of user details failed", error);
                addError(messages.userDetailsUpdatedFailure);
                if (languageChanges.length > 0) {
                    onLanguagesSaveFailed?.();
                }
            })
            .finally(() => setIsProcessing(false));
    };

    const isDirty = useMemo(
        () =>
            stringify(user) !== stringify(updatedUser) ||
            isAdmin !== isUpdatedAdmin ||
            languageChanges.length > 0,
        [user, updatedUser, isAdmin, isUpdatedAdmin, languageChanges],
    );

    return {
        updatedUser,
        isUpdatedAdmin,
        updatedLanguages,
        onLanguagesChange: setUpdatedLanguages,
        onChange,
        onSave,
        isDirty,
        isProcessing,
    };
};

export const useUserGroupDetails = (
    userGroup: IUserGroup | undefined,
    onSubmit: (userGroup: IUserGroup) => void,
    onCancel: () => void,
) => {
    const { addSuccess, addError } = useToastMessage();
    const [updatedUserGroup, setUpdatedUserGroup] = useState(userGroup);
    const backend = useBackendStrict();
    const organizationId = useOrganizationId();
    const [isProcessing, setIsProcessing] = useState(false);
    const trackEvent = useTelemetry();

    // update user group from props (when dialog is opened directly in edit mode and we wait for fetch result)
    useEffect(() => {
        setUpdatedUserGroup(userGroup);
    }, [userGroup]);

    const onSave = () => {
        if (!updatedUserGroup) {
            return;
        }
        setIsProcessing(true);
        backend
            .organization(organizationId)
            .users()
            .updateUserGroup(updatedUserGroup)
            .then(() => {
                addSuccess(messages.userGroupDetailsUpdatedSuccess);
                trackEvent("group-detail-updated");
                onSubmit(updatedUserGroup);
                onCancel();
            })
            .catch((error) => {
                console.error("Change of user userGroup details failed", error);
                addError(messages.userGroupDetailsUpdatedFailure);
            })
            .finally(() => setIsProcessing(false));
    };

    const isDirty = useMemo(
        () => stringify(userGroup) !== stringify(updatedUserGroup),
        [userGroup, updatedUserGroup],
    );

    return {
        updatedUserGroup,
        onChange: setUpdatedUserGroup,
        onSave,
        isDirty,
        isProcessing,
    };
};
