// (C) 2007-2020 GoodData Corporation
import React from "react";
import HeaderIcon from "./HeaderIcon";

interface IFaviconProps {
    url?: string;
}

const Favicon: React.FC<IFaviconProps> = ({ url = "" }) => (
    <HeaderIcon rel="shortcut icon" type="image/x-icon" url={url} />
);

export default Favicon;
