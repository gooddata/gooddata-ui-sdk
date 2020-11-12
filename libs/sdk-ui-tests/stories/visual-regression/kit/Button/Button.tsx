// (C) 2020 GoodData Corporation
import { Button } from "@gooddata/sdk-ui-kit";
import React from "react";
import uniqueId from "lodash/uniqueId";

import { storiesOf } from "@storybook/react";
import { UiKit } from "../../../_infra/storyGroups";
import { withScreenshot } from "../../../_infra/backstopWrapper";
import { wrapWithTheme } from "../../themeWrapper";

import "@gooddata/sdk-ui-kit/styles/css/button.css";
import "./styles.scss";

const types = [
    {
        title: "Apply",
        className: "gd-button-primary",
    },
    {
        title: "Run",
        className: "gd-button-secondary",
    },
    {
        title: "Edit",
        className: "gd-button-link",
    },
    {
        title: "Edit",
        className: "gd-button-link-dimmed",
    },
    {
        title: "Activate weapons",
        className: "gd-button-link",
        iconLeft: "icon-cloud-upload",
    },
    {
        title: "Deploy process",
        className: "gd-button-link-dimmed",
        iconLeft: "icon-cloud-upload",
    },
    {
        title: "",
        className: "gd-button-link gd-button-icon-only",
        iconLeft: "icon-save",
    },
    {
        title: "Save",
        className: "gd-button-action",
    },
    {
        title: "Delete",
        className: "gd-button-negative",
    },
    {
        title: "New Schedule",
        className: "gd-button-action",
        iconLeft: "icon-timer",
    },
    {
        title: "New Schedule",
        className: "gd-button-action icon-timer",
    },
    {
        title: "Add Report",
        className: "gd-button-primary",
        iconLeft: "icon-add",
    },
    {
        title: "Add Report",
        className: "gd-button-primary icon-add",
    },
    {
        title: "Create Report",
        className: "gd-button-action gd-button-important",
    },
    {
        title: "Delete Account",
        className: "gd-button-negative gd-button-important",
    },
    {
        title: "Save",
        className: "gd-button-primary gd-button-small",
    },
    {
        title: "Cancel",
        className: "gd-button-secondary gd-button-small",
    },
    {
        title: "Add Tab",
        className: "gd-button-secondary gd-button-small",
        iconRight: "icon-add",
    },
    {
        title: "Add Tab",
        className: "gd-button-secondary gd-button-small icon-add icon-right",
    },
    {
        title: "Add Tab",
        className: "gd-button-secondary gd-button-small",
        iconLeft: "icon-add",
    },
    {
        title: "Add Tab",
        className: "gd-button-secondary gd-button-small icon-add",
    },
    {
        title: "",
        className: "gd-button-primary gd-button-icon-only icon-add",
    },
    {
        title: "",
        className: "gd-button-primary",
        iconLeft: "icon-add",
    },
    {
        title: "",
        className: "gd-button-primary gd-button-icon-only icon-config",
    },
    {
        title: "",
        className: "gd-button-primary",
        iconLeft: "icon-config",
    },
    {
        title: "",
        className: "gd-button-primary gd-button-icon-only icon-printer",
    },
    {
        title: "",
        className: "gd-button-primary",
        iconLeft: "icon-printer",
    },
    {
        title: "",
        className: "gd-button-primary gd-button-icon-only icon-pencil",
    },
    {
        title: "",
        className: "gd-button-primary",
        iconLeft: "icon-pencil",
    },
    {
        title: "",
        className: "gd-button-primary gd-button-icon-only icon-cross",
    },
    {
        title: "",
        className: "gd-button-primary",
        iconLeft: "icon-cross",
    },
];

const icons = [
    "trend-down",
    "trend-up",
    "user",
    "ghost",
    "redo",
    "undo",
    "pause",
    "users",
    "rain",
    "calendar",
    "circle-exclamation",
    "circle-question",
    "dropright",
    "dropdown",
    "question",
    "number",
    "navigateleft",
    "navigateright",
    "navigatedown",
    "navigateup",
    "pencil",
    "magic",
    "upload",
    "lock",
    "unlock",
    "settings",
    "trash",
    "at-sign",
    "envelope",
    "visible",
    "invisible",
    "save",
    "printer",
    "file",
    "folder",
    "enter",
    "earth",
    "bell",
    "horn",
    "sync",
    "clock",
    "timer",
    "download",
    "magnifier",
    "checkmark",
    "cross",
    "chevron-up",
    "chevron-down",
    "chevron-left",
    "chevron-right",
    "arrow-up",
    "arrow-down",
    "arrow-left",
    "arrow-right",
    "tab",
    "warning",
    "circle-checkmark",
    "circle-cross",
    "circle-plus",
    "circle-minus",
    "filter",
    "sharp",
    "money",
    "percent",
    "plus",
    "A",
    "copyright",
    "all",
    "greater-than",
    "greater-than-equal-to",
    "less-than",
    "less-than-equal-to",
    "between",
    "not-between",
    "equal-to",
    "not-equal-to",
    "label",
    "hyperlink",
    "fact",
    "attribute",
    "date",
];

const getButtons = () => {
    return types.map((item) => {
        return (
            <tr key={uniqueId("button-")}>
                <td>
                    <Button
                        value={item.title}
                        className={item.className}
                        iconLeft={item.iconLeft}
                        iconRight={item.iconRight}
                    />
                    <Button
                        value={item.title}
                        className={item.className}
                        iconLeft={item.iconLeft}
                        iconRight={item.iconRight}
                        disabled
                    />
                </td>
                <td className="example-buttons-button-class">
                    <code>{item.className}</code>
                    {item.iconLeft && (
                        <div>
                            <code>{item.iconLeft}</code>
                        </div>
                    )}
                    {item.iconRight && (
                        <div>
                            <code>{item.iconRight}</code>
                        </div>
                    )}
                </td>
            </tr>
        );
    });
};

const getGroupButtons = () => (
    <tr key={uniqueId("button-")}>
        <td>
            <div className="gd-button-group">
                <Button className="gd-button-secondary" value="1" />
                <Button className="gd-button-secondary" value="2" />
                <Button className="gd-button-secondary" value="3" />
            </div>
        </td>
        <td className="example-buttons-button-class">
            <code>gd-button-group</code>
        </td>
    </tr>
);

const getIcons = () => {
    return icons.map((item) => {
        return <Button key={uniqueId("button-")} value={item} className={`gd-button-link icon-${item}`} />;
    });
};

const ButtonTest: React.FC = () => (
    <div className="library-component screenshot-target">
        <Button className="gd-button-link icon-uploadcloud" value="Deploy process" tagName="a" />
        <h4>Links</h4>
        Use <code>a</code> as a tagName.
        <Button className="gd-button-link icon-uploadcloud" value="Deploy process" tagName="a" />
        <h4>Buttons</h4>
        <table className="example-table">
            <tbody>
                <tr key="header">
                    <th>Example</th>
                    <th>ClassNames</th>
                </tr>
                {getButtons()}
                {getGroupButtons()}
            </tbody>
        </table>
        <h4>Icons</h4>
        <div className="icons-list">{getIcons()}</div>
    </div>
);

storiesOf(`${UiKit}/Button`, module).add("full-featured button", () => withScreenshot(<ButtonTest />));
storiesOf(`${UiKit}/Button`, module).add("themed", () => withScreenshot(wrapWithTheme(<ButtonTest />)));
