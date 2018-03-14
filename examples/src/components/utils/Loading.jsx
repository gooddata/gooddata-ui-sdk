// (C) 2007-2018 GoodData Corporation

import React from 'react';
import PropTypes from 'prop-types';

import '@gooddata/react-components/styles/css/main.css';

const baseAnimationDuration = 1.8;

export const Loading = ({ label, inline, height, width, color, speed }) => (
    <div
        className="s-loading"
        style={{
            textAlign: 'center',
            display: inline ? 'inline-flex' : 'flex',
            flexDirection: 'column',
            alignContent: 'center',
            justifyContent: 'center',
            height: '100%'
        }}
    >
        {label ? <h3>{label}</h3> : null}
        <img alt="loading…" style={{ maxHeight: '100%', maxWidth: '100%', flex: '0 1 auto', height, width }} src={`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 38 38" xml:space="preserve" height="38" width="38"><style>.GDC-loading-bar-1, .GDC-loading-bar-2, .GDC-loading-bar-3 {transform-origin: 0 100%;animation: GDC-pump ${baseAnimationDuration / speed}s infinite;fill: ${color};}.GDC-loading-bar-1 {animation-delay: ${(baseAnimationDuration / speed) * (-2 / 3)}s;}.GDC-loading-bar-2 {animation-delay: ${baseAnimationDuration / speed / -3}s;}@keyframes GDC-pump {0%   {transform: scaleY(0.33)}33%  {transform: scaleY(0.66)}66%  {transform: scaleY(1)}100% {transform: scaleY(0.33)}}</style><rect class="GDC-loading-bar-1" x="0" y="0" width="10" height="38" /><rect class="GDC-loading-bar-2" x="14" y="0" width="10" height="38" /><rect class="GDC-loading-bar-3" x="28" y="0" width="10" height="38" /></svg>`} />
    </div>
);
Loading.propTypes = {
    color: PropTypes.string,
    speed: PropTypes.number,
    inline: PropTypes.bool,
    height: PropTypes.any,
    width: PropTypes.any,
    label: PropTypes.string
};
Loading.defaultProps = {
    color: '#14b2e2',
    speed: 1,
    inline: false,
    height: 38,
    width: undefined,
    label: null
};


export default Loading;
