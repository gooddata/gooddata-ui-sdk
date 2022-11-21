// (C) 2020-2022 GoodData Corporation
import React, { useState } from "react";
import classNames from "classnames";
import { Button } from "@gooddata/sdk-ui-kit";
import Measure from "react-measure";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { FormattedMessage, useIntl } from "react-intl";
import { IDashboardWidgetOverlay } from "../../../model";

type DashboardItemOverlayProps = {
    render?: boolean;
    type: "row" | "column";
    modifications: Required<IDashboardWidgetOverlay>["modification"][];
    onHide?: () => void;
};

export const DashboardItemOverlay: React.FunctionComponent<DashboardItemOverlayProps> = ({
    render,
    type,
    modifications,
    onHide,
}) => {
    const intl = useIntl();
    const added = modifications.includes("insertedByPlugin");
    const modified = modifications.includes("modifiedByPlugin");

    const theme = useTheme();
    const [size, setSize] = useState<"big" | "small" | "none">("none");
    const [height, setHeight] = useState(0);
    const classes = classNames("gd-fluidlayout-item-changed", {
        [type]: true,
        [size]: true,
        added: added,
        modified: modified,
    });
    const show = render && (added || modified);

    return show ? (
        <Measure
            client
            onResize={(data) => {
                if (data.client) {
                    setSize(data.client.height < 100 ? "small" : "big");
                    setHeight(data.client.height);
                }
            }}
        >
            {({ measureRef }) => (
                <div className={classes} ref={measureRef}>
                    <div className="gd-fluidlayout-item-changed-content">
                        <div className="gd-fluidlayout-item-changed-icon" style={height ? { height } : {}}>
                            <PluginIcon color={theme?.palette?.complementary?.c7} />
                        </div>
                        <div className="gd-fluidlayout-item-changed-info">
                            <DashboardItemOverlayInfo added={added} modified={modified} />
                        </div>
                        <Button
                            className="gd-button gd-button-link"
                            value={intl.formatMessage({ id: "layout.widget.hideOverlay" })}
                            onClick={onHide}
                        />
                    </div>
                </div>
            )}
        </Measure>
    ) : null;
};

const DashboardItemOverlayInfo: React.FunctionComponent<{ added: boolean; modified: boolean }> = ({
    added,
    modified,
}) => {
    if (added) {
        return <FormattedMessage id="layout.widget.addedByPlugin" />;
    }
    if (modified) {
        return <FormattedMessage id="layout.widget.modifiedByPlugin" />;
    }
    return null;
};

const PluginIcon: React.FunctionComponent<{ color?: string }> = ({ color }) => {
    return (
        <svg width="29" height="35" viewBox="0 0 29 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M15.6264 2.50847C14.8954 2.26481 14.1052 2.26481 13.3742 2.50847L13.2559 2.54788C11.124 3.25852 10.1752 5.74192 11.2901 7.69306L11.8345 8.64571C12.6873 10.1381 11.3879 11.9409 9.70247 11.6038L2.30263 10.1238C2.16491 10.0963 2.03641 10.2016 2.03641 10.342V32.3544C2.03641 32.4773 2.13606 32.577 2.25898 32.577H25.7456C25.859 32.577 25.9543 32.4917 25.9668 32.379L26.7587 25.2513C26.7776 25.0818 26.6066 24.955 26.4499 25.0222L23.9499 26.0936C21.5157 27.1368 18.6851 26.2215 17.3226 23.9506C16.3163 22.2735 16.3163 20.1783 17.3226 18.5012C18.6851 16.2303 21.5157 15.315 23.9499 16.3582L26.4499 17.4296C26.6066 17.4968 26.7776 17.37 26.7587 17.2005L25.9937 10.3154C25.9791 10.1838 25.8535 10.0939 25.7242 10.1227L19.3749 11.5336C17.6773 11.9109 16.3383 10.0943 17.2011 8.58438L17.7105 7.69306C18.8254 5.74192 17.8766 3.25852 15.7447 2.54788L15.6264 2.50847ZM12.8111 0.819283C13.9076 0.453794 15.093 0.453794 16.1895 0.819283L16.3077 0.858699C19.5056 1.92465 20.9288 5.64975 19.2564 8.57646L18.7471 9.46779C18.6512 9.63555 18.8 9.8374 18.9886 9.79548L25.338 8.38451C26.5014 8.12598 27.6318 8.93425 27.7634 10.1187L28.5284 17.0039C28.6979 18.5293 27.1592 19.6708 25.7485 19.0662L23.2485 17.9948C21.6327 17.3024 19.7538 17.9099 18.8494 19.4173C18.1815 20.5305 18.1815 21.9213 18.8494 23.0345C19.7538 24.5419 21.6327 25.1495 23.2485 24.457L25.7485 23.3856C27.1592 22.781 28.6979 23.9225 28.5284 25.448L27.7364 32.5756C27.6237 33.59 26.7663 34.3575 25.7456 34.3575H2.25898C1.15269 34.3575 0.255859 33.4607 0.255859 32.3544V10.342C0.255859 9.07798 1.41231 8.12991 2.65183 8.37782L10.0517 9.85778C10.2389 9.89524 10.3833 9.69493 10.2886 9.52911L9.74419 8.57646C8.07178 5.64975 9.49501 1.92465 12.6929 0.858699L12.8111 0.819283Z"
                fill={color ?? "#687581"}
            />
        </svg>
    );
};
