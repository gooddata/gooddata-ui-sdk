// (C) 2007-2025 GoodData Corporation
import React, { useCallback } from "react";
// storiesOf removed for CSF migration
import { withIntl } from "@gooddata/sdk-ui";
import { action } from "storybook/actions";
import {
    AppHeader,
    IAppHeaderProps,
    HeaderWorkspacePicker,
    WorkspacePickerHomeFooter,
    HeaderBadge,
} from "@gooddata/sdk-ui-kit";
import { wrapWithTheme } from "../../themeWrapper.js";
import { IntlProvider } from "react-intl";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";
import times from "lodash/times.js";
import { gd, custom } from "./logos.js";

const info = {
    headerMenuSections: [
        [
            {
                key: "gs.header.dashboards",
                className: "s-menu-dashboards",
                href: "/",
            },
            {
                key: "gs.header.reports",
                className: "s-menu-reports",
                href: "/reports",
            },
        ],
        [
            {
                key: "gs.header.kpis",
                className: "s-menu-kpis",
                href: "/kpis",
                isActive: true,
            },
            {
                key: "gs.header.analyze",
                className: "s-menu-analyze",
                href: "/analyze",
            },
            {
                key: "gs.header.load",
                className: "s-menu-load",
                href: "/load",
            },
        ],
        [
            {
                key: "gs.header.manage",
                className: "s-menu-manage",
                href: "/manage",
            },
        ],
    ],
    headerAccountItems: [
        {
            key: "gs.header.account",
            href: "/account",
        },
        {
            key: "gs.header.logout",
            href: "/logout",
        },
    ],
    headerHelpItems: [
        {
            key: "gs.header.documentation",
            href: "https://help.gooddata.com/doc",
            target: "_blank",
        },
        {
            key: "gs.header.visitSupportPortal",
            href: "https://support.gooddata.com",
        },
        {
            key: "gs.header.submitTicket",
            href: "https://support.gooddata.com/hc/en-us/requests/new",
        },
    ],
};

const getWorkspaceDescriptors = (count: number = 10) => {
    return times(count, (i) => ({
        id: `${i + 1}`,
        title: `Project ${i + 1}`,
        description: `This is Project ${i + 1}`,
        isDemo: i % 2 === 1 && i < 10,
    }));
};

const getPicker = (selectedWorkspace: any) => (
    <HeaderWorkspacePicker
        className={"s-app-header-workspace-picker"}
        workspaces={getWorkspaceDescriptors()}
        selectedWorkspace={selectedWorkspace}
        totalWorkspacesCount={10}
    />
);

function HeaderExamples() {
    const onHeaderLogoClick = (...args: any[]) => {
        console.log("onHeaderLogoClick", ...args); // eslint-disable-line no-console
    };

    const onMenuClick = (menuItem: any) => {
        console.log("onMenuClick: ", menuItem); // eslint-disable-line no-console
    };

    const getDarkBranding = (): Partial<IAppHeaderProps> => {
        return {
            logoTitle: "Fleet Discovery",
            headerColor: "#0d2c6b",
            activeColor: "#e72c2a",
            headerTextColor: "#FFFFFF",
        };
    };

    const getLightBranding = (): Partial<IAppHeaderProps> => {
        return {
            logoUrl: custom,
            logoTitle: "DataCorp",
            headerColor: "#ffffff",
        };
    };

    const getSocialTablesBranding = (): Partial<IAppHeaderProps> => {
        return {
            logoTitle: "SpecialTables",
            headerColor: "#CB5599",
        };
    };

    const getOptixBranding = (): Partial<IAppHeaderProps> => {
        return {
            logoUrl: custom,
            logoTitle: "Big Analytics",
            headerColor: "#373D41",
            activeColor: "#FDA32D",
        };
    };

    const getHeaderMenuSections = (): IAppHeaderProps["menuItemsGroups"] => {
        return info.headerMenuSections;
    };

    const getAccountMenuItems = (): IAppHeaderProps["accountMenuItems"] => {
        return info.headerAccountItems;
    };

    const getHelpMenuItems = (): IAppHeaderProps["helpMenuItems"] => {
        return info.headerHelpItems;
    };

    const getExampleProps = useCallback((): IAppHeaderProps => {
        return {
            onLogoClick: onHeaderLogoClick,
            onMenuItemClick: onMenuClick,
            menuItemsGroups: getHeaderMenuSections(),
            accountMenuItems: getAccountMenuItems(),
            helpMenuItems: getHelpMenuItems(),
            workspacePicker: null,
            userName: "",
        };
    }, [onHeaderLogoClick, onMenuClick]);

    const renderHeaderExample = useCallback(() => {
        return (
            <AppHeader
                className="s-default-header"
                {...getExampleProps()}
                logoUrl={gd}
                logoTitle="GoodData"
                documentationUrl="https://help.gooddata.com/doc"
                userName="John Doe"
                workspacePicker={getPicker({
                    title: "GoodSales",
                    id: "0",
                })}
            />
        );
    }, [getExampleProps]);

    const renderDarkHeaderExample = useCallback(() => {
        return (
            <AppHeader
                {...getExampleProps()}
                {...getDarkBranding()}
                userName="Jara Cimrman"
                workspacePicker={getPicker({
                    title: "Lorem ipsum dolor sit amet sin hubas",
                    id: "0",
                })}
            />
        );
    }, [getExampleProps, getDarkBranding]);

    const renderLightHeaderExample = useCallback(() => {
        return (
            <AppHeader
                {...getExampleProps()}
                {...getLightBranding()}
                userName="Chose Chroustal"
                workspacePicker={getPicker({
                    title: "Analytics",
                    id: "0",
                })}
            />
        );
    }, [getExampleProps, getLightBranding]);

    const renderSocialTablesHeaderExample = useCallback(() => {
        return (
            <AppHeader
                {...getExampleProps()}
                {...getSocialTablesBranding()}
                userName="Leonardo Da Vinci"
                workspacePicker={getPicker({
                    title: "Project",
                    id: "0",
                })}
            />
        );
    }, [getExampleProps, getSocialTablesBranding]);

    const renderEnergySavvyHeaderExample = useCallback(() => {
        return (
            <AppHeader
                {...getExampleProps()}
                userName="Salvador Felipe Jacinto Dalí"
                {...getOptixBranding()}
                workspacePicker={null}
            />
        );
    }, [getExampleProps, getOptixBranding]);

    const renderCustomWorkspacePickerExample = useCallback(() => {
        const workspaces = getWorkspaceDescriptors(3);

        const newFreemiumWorkspacePickerFooter = (
            <WorkspacePickerHomeFooter href="/domain/home">Home</WorkspacePickerHomeFooter>
        );

        const newFreemiumWorkspacePicker = (
            <HeaderWorkspacePicker
                className={"s-app-header-workspace-picker"}
                workspaces={workspaces}
                selectedWorkspace={workspaces[0]}
                totalWorkspacesCount={workspaces.length}
                projectPickerFooter={newFreemiumWorkspacePickerFooter}
            />
        );

        return (
            <AppHeader
                {...getExampleProps()}
                className="s-freemium-header"
                logoUrl={gd}
                userName="Freemium user"
                workspacePicker={newFreemiumWorkspacePicker}
                logoHref="/custom/logo/href"
            />
        );
    }, [getExampleProps]);

    const renderBadgesExample = useCallback(
        (headerColor?: string) => {
            return (
                <AppHeader
                    {...getExampleProps()}
                    logoUrl={gd}
                    logoTitle="GoodData"
                    workspacePicker={null}
                    userName="Short"
                    headerColor={headerColor}
                    badges={[
                        <HeaderBadge backgroundColor="rgba(20,178,226,0.3)" color="#14B2E2" key="first">
                            First
                        </HeaderBadge>,
                        <HeaderBadge backgroundColor="red" key="second">
                            Second
                        </HeaderBadge>,
                    ]}
                />
            );
        },
        [getExampleProps],
    );

    return (
        <div className="library-component screenshot-target">
            <h4>Header</h4>
            {renderHeaderExample()}

            <h4>White-labeled headers</h4>
            {renderLightHeaderExample()}

            <br />
            {renderDarkHeaderExample()}

            <br />
            {renderSocialTablesHeaderExample()}

            <br />
            {renderEnergySavvyHeaderExample()}

            <br />
            <h4>Custom workspace picker footer</h4>
            {renderCustomWorkspacePickerExample()}

            <br />
            <h4>Badges support</h4>
            {renderBadgesExample()}
            <br />
            {renderBadgesExample("#ffffff")}
        </div>
    );
}

const messages = {
    "gs.header.dashboards": "Dashboards",
    "gs.header.reports": "Reports",
    "gs.header.kpis": "KPIs",
    "gs.header.analyze": "Analyze",
    "gs.header.load": "Load",
    "gs.header.manage": "Manage",
    "gs.header.help": "Help",
    "gs.header.search": "Search",
    "gs.header.documentation": "Documentation",
    "gs.header.visitSupportPortal": "Visit Support Portal",
    "gs.header.submitTicket": "Submit Ticket",
    "gs.header.helpMenu.manage.ws": "Managing workspaces and workspace hierarchy",
    "gs.header.account": "Account",
    "gs.header.logout": "Logout",
    "gs.header.projectPicker.demo": "Demo data",
    "gs.header.projectPicker.searchPlaceholder": "Search...",
    "gs.header.projectPicker.searchLabel": "Search",
    "gs.header.projectPicker.workspaces": "Workspaces",
    "gs.header.account.title": "Account",
};
const WithIntl = withIntl(HeaderExamples, "en-US", messages);

const screenshotProps = {
    closed: {},
    openedProjectPicker: {
        clickSelector: ".s-default-header .s-goodsales",
        postInteractionWait: 200,
    },
    openedProjectPickerWithFooter: {
        clickSelector: ".s-freemium-header .s-project_1",
        postInteractionWait: 200,
    },
    openedHelp: {
        clickSelector: ".s-default-header .gd-header-help",
        postInteractionWait: 200,
    },
    openedAccount: {
        clickSelector: ".s-default-header .gd-header-account",
        postInteractionWait: 200,
    },
};

export default {
    title: "12 UI Kit/AppHeader",
};

export const FullFeatured = () => <WithIntl />;
FullFeatured.parameters = { kind: "full-featured", screenshots: screenshotProps };

export const Themed = () => wrapWithTheme(<WithIntl />);
Themed.parameters = { kind: "themed", screenshot: screenshotProps.openedProjectPicker };

export const DropdownHelpMenuShouldBeBottomTopLeftPositionWhenEnoughSpaceForMaxWidthHelpContent = () => (
    <IntlProvider locale="en-US" messages={messages}>
        <div className="screenshot-target">
            <AppHeader
                className="s-default-header"
                helpMenuItems={[
                    {
                        key: "gs.header.helpMenu.manage.ws",
                        href: "https://www.gooddata.com/developers/cloud-native/doc/hosted/manage-deployment/manage-workspaces/",
                    },
                    ...info.headerHelpItems,
                ]}
                helpMenuDropdownAlignPoints={"bl tl"}
                badges={[
                    <HeaderBadge backgroundColor="rgba(20,178,226,0.3)" color="#14B2E2" key="first">
                        Community
                    </HeaderBadge>,
                ]}
                workspacePicker={null}
                userName={"undefined"}
            />
        </div>
    </IntlProvider>
);
DropdownHelpMenuShouldBeBottomTopLeftPositionWhenEnoughSpaceForMaxWidthHelpContent.parameters = {
    kind: "dropdown help menu should be bottom top left position when enough space for max-width help content",
    screenshot: screenshotProps.openedHelp,
};

export const DropdownHelpMenuShouldBeBottomTopRightPositionWhenNotEnoughSpaceForMaxWidthHelpContent = () => (
    <IntlProvider locale="en-US" messages={messages}>
        <div className="screenshot-target">
            <AppHeader
                className="s-default-header"
                helpMenuItems={[
                    {
                        key: "gs.header.helpMenu.manage.ws",
                        href: "https://www.gooddata.com/developers/cloud-native/doc/hosted/manage-deployment/manage-workspaces/",
                    },
                    ...info.headerHelpItems,
                ]}
                helpMenuDropdownAlignPoints={"bl tl"}
                workspacePicker={null}
                userName={"undefined"}
            />
        </div>
    </IntlProvider>
);
DropdownHelpMenuShouldBeBottomTopRightPositionWhenNotEnoughSpaceForMaxWidthHelpContent.parameters = {
    kind: "dropdown help menu should be bottom top right position when not enough space for max-width help content",
    screenshot: screenshotProps.openedHelp,
};

export const WithSearchMenuItem = () => (
    <IntlProvider locale="en-US" messages={messages}>
        <div className="screenshot-target">
            <AppHeader
                className="s-default-header"
                onLogoClick={action("onLogoClick")}
                onMenuItemClick={action("onMenuItemClick")}
                menuItemsGroups={info.headerMenuSections}
                accountMenuItems={info.headerAccountItems}
                helpMenuItems={[
                    {
                        key: "gs.header.helpMenu.manage.ws",
                        href: "https://www.gooddata.com/developers/cloud-native/doc/hosted/manage-deployment/manage-workspaces/",
                    },
                    ...info.headerHelpItems,
                ]}
                search={<div>Search contents mock</div>}
                logoUrl={gd}
                logoTitle="GoodData"
                documentationUrl="https://help.gooddata.com/doc"
                userName="John Doe"
                workspacePicker={getPicker({
                    title: "GoodSales",
                    id: "0",
                })}
            />
        </div>
    </IntlProvider>
);
WithSearchMenuItem.parameters = { kind: "with search menu item", screenshot: true };
