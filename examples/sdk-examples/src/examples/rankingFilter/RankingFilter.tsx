// (C) 2020 GoodData Corporation
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import { RankingFilterSimpleExample } from "./RankingFilterSimpleExample";
import RankingFilterSimpleExampleSRC from "./RankingFilterSimpleExample?raw"; // eslint-disable-line import/no-unresolved
import RankingFilterSimpleExampleSRCJS from "./RankingFilterSimpleExample?rawJS"; // eslint-disable-line import/no-unresolved, import/default

import { RankingFilterExample } from "./RankingFilterExample";
import RankingFilterExampleSRC from "./RankingFilterExample?raw"; // eslint-disable-line import/no-unresolved
import RankingFilterExampleSRCJS from "./RankingFilterExample?rawJS"; // eslint-disable-line import/no-unresolved, import/default

import { RankingFilterCustomButtonExample } from "./RankingFilterCustomButtonExample";
import RankingFilterCustomButtonExampleSRC from "./RankingFilterCustomButtonExample?raw"; // eslint-disable-line import/no-unresolved
import RankingFilterCustomButtonExampleSRCJS from "./RankingFilterCustomButtonExample?rawJS"; // eslint-disable-line import/no-unresolved, import/default

export const RankingFilter: React.FC = () => (
    <div>
        <h1>Ranking filter</h1>
        <p>
            The example below shows simple usage of the ranking filter in pivot table. It shows sales of top 3
            locations
        </p>
        <div className="s-ranking-filter-example-1">
            <ExampleWithSource
                for={RankingFilterSimpleExample}
                source={RankingFilterSimpleExampleSRC}
                sourceJS={RankingFilterSimpleExampleSRCJS}
            />
        </div>
        <p>The example below shows general usage of the component for managing the ranking filter.</p>
        <div className="s-ranking-filter-example-2">
            <ExampleWithSource
                for={RankingFilterExample}
                source={RankingFilterExampleSRC}
                sourceJS={RankingFilterExampleSRCJS}
            />
        </div>
        <p>The example below shows how to create custom ranking filter button.</p>
        <div className="s-ranking-filter-example-3">
            <ExampleWithSource
                for={RankingFilterCustomButtonExample}
                source={RankingFilterCustomButtonExampleSRC}
                sourceJS={RankingFilterCustomButtonExampleSRCJS}
            />
        </div>
    </div>
);
