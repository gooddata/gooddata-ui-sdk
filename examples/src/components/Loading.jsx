
import React from 'react';
import PropTypes from 'prop-types';

import '@gooddata/react-components/styles/css/main.css';

export const Loading = ({ label }) => (
    <div
        className="s-loading"
        style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignContent: 'center',
            justifyContent: 'center',
            height: '100%'
        }}
    >
        {label ? <h3>{label}</h3> : null}
        <img alt="loading…" src='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 38 38" xml:space="preserve" height="38" width="38"><style>.test { background: red; } .GDC-loading-bar-1, .GDC-loading-bar-2, .GDC-loading-bar-3 {transform-origin: 0 100%;animation: GDC-pump 1.8s infinite;fill: #14b2e2;}.GDC-loading-bar-1 {animation-delay: -1.33s;}.GDC-loading-bar-2 {animation-delay: -0.66s;}@keyframes GDC-pump {0%   {transform: scaleY(0.33)}33%  {transform: scaleY(0.66)}66%  {transform: scaleY(1)}100% {transform: scaleY(0.33)}}</style><rect class="GDC-loading-bar-1" x="0" y="0" width="10" height="38" /><rect class="GDC-loading-bar-2" x="14" y="0" width="10" height="38" /><rect class="GDC-loading-bar-3" x="28" y="0" width="10" height="38" /></svg>' />
    </div>
);
Loading.propTypes = {
    label: PropTypes.string
};
Loading.defaultProps = {
    label: null
};


export default Loading;
