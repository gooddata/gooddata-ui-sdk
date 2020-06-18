// (C) 2019-2020 GoodData Corporation
import ReactGA from "react-ga";
import { history } from "./history";

const GA_ID = "UA-3766725-19";
const isProduction = process.env.NODE_ENV === "production";

ReactGA.initialize(GA_ID, {
    testMode: !isProduction,
});

history.listen((location) => {
    ReactGA.pageview(location.pathname + location.search);
});
