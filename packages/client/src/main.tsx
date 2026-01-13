/// <reference path="./vite-env.d.ts" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

// Core
import '@m3e/theme';
// Components
import '@m3e/button';
import '@m3e/card';
import '@m3e/dialog';
import '@m3e/fab';
import '@m3e/form-field';
import '@m3e/icon';
import '@m3e/icon-button';
import '@m3e/segmented-button';
import '@m3e/slider';
import '@m3e/switch';
import '@m3e/nav-rail';
import '@m3e/nav-bar';
import '@m3e/divider';
import '@m3e/heading';

import { App } from './App';

ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);