import React from 'react';


import Layout from '../components/Layout';
import ExampleWithSource from '../utils/ExampleWithSource';

import AttributeFilterExample from '../components/AttributeFilterExample';
import AttributeElementsExample from '../components/AttributeElementsExample';

import AttributeFilterExampleSRC from '!raw-loader!../components/AttributeFilterExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import AttributeElementsExampleSRC from '!raw-loader!../components/AttributeElementsExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first


export const AttributeFilter = props => (<Layout {...props} >
    <h1>Attribute Filter Components</h1>

    <p>These examples illustrate usage of Attribute Filter components.</p>

    <h2>Attribute Filter</h2>
    <ExampleWithSource for={AttributeFilterExample} source={AttributeFilterExampleSRC} />

    <h2>Custom Attribute Filter using Attribute Elements component</h2>
    <ExampleWithSource for={AttributeElementsExample} source={AttributeElementsExampleSRC} />

</Layout>);

export default AttributeFilter;
