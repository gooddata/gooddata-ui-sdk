// (C) 2007-2019 GoodData Corporation
import React from "react";
import { workspace } from "../constants/fixtures";
import logicalDataModel from "../static/logicalDataModel.png";

export const AboutThisWorkspace: React.FC = () => (
    <div>
        <h1>About This Workspace</h1>
        <p>
            This workspace (ID <code>{workspace}</code>) is created specifically for testing purposes. You can
            use the data from this workspace for testing or trying out the functionality of GoodData.UI.
        </p>
        <p>
            The use case that this workspace describes is a chain of restaurants where some restaurants are
            franchised. As the owner of the business, you want to make successful business decisions and build
            a growth strategy. For example, you need to track food and beverage costs and employees&apos;
            shifts, stuff the restaurants depending on how busy a day is, and look for efficient ways of
            cutting costs.
        </p>

        <h2>What Data This Workspace Contains</h2>
        <p>
            Your source data comes from sales (meal prices, the number of meals per order) and costs
            (operational, labor, COG, occupancy).
        </p>
        <p>
            The workspace stores a set of attributes that describe restaurants themselves (location, category,
            ownership, franchised or not), staff (employee ID and name), menu (meal category and name, for
            kids or not) and transactions (transaction ID).
        </p>
        <p>
            By default, the workspace also provides date attributes that enable aggregation at the day, week,
            month, quarter, and year level.
        </p>

        <h2>Logical Data Model</h2>
        <p>
            The logical data model establishes and represents relationships between different types of data in
            the workspace. For more information about logical data models, see{" "}
            <a
                href="https://help.gooddata.com/display/doc/GoodData+Modeling+Concepts"
                target="_blank"
                rel="noopener noreferrer"
            >
                https://help.gooddata.com/display/doc/GoodData+Modeling+Concepts
            </a>
            .
        </p>
        <img src={logicalDataModel} alt="Logical Data Model" />

        <h2>Analyzing Data</h2>
        <p>
            Using the source data, you can create all kinds of measures to reflect different aspects of the
            business. You can build various reports, slice the data by many types of attributes, and filter
            out the data that is most relevant to you.
        </p>
        <p>Here are some examples of what you can track and analyze:</p>
        <ul>
            <li>
                Total sales for all restaurants in the chain =&gt; compare it to previous years, track how it
                changes through a year
            </li>
            <li>
                Total sales for owned and franchised restaurants separately =&gt; decide on expanding or
                shrinking the franchise strategy
            </li>
            <li>
                Total sales for each individual restaurant =&gt; discover top 10 restaurants with the highest
                sales and bottom 10 restaurants with the lowests sales
            </li>
            <li>Best and worst performing servers =&gt; consider promotions, pay raise, or lay-offs</li>
            <li>Best and worst performing regions =&gt; consider re-location, closing/opening</li>
            <li>
                Average total daily sales =&gt; keep informed that it&apos;s always above a certain number and
                get notified if it drops below this number
            </li>
            <li>Schedules and actual labor costs =&gt; assess your cost planning effectiveness</li>
            <li>
                Sales for a particular restaurant for the last 4 quarters =&gt; if going down, request for
                more detailed information
            </li>
        </ul>
        <p>and many more.</p>
    </div>
);
