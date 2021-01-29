// (C) 2007-2020 GoodData Corporation
import React from "react";
import HeaderIcon from "./HeaderIcon";

interface IAppleTouchIconProps {
    url?: string;
}

const AppleTouchIcon: React.FC<IAppleTouchIconProps> = ({ url = "" }) => (
    <HeaderIcon rel="apple-touch-icon" type="image/png" url={url} />
);

export default AppleTouchIcon;
