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
// Navigation
import '@m3e/nav-rail'; // <-- Сама рельса
import '@m3e/nav-bar';  // <-- Отсюда берется m3e-nav-item

import { App } from './components/App';

const root = document.getElementById('app');
if (root) {
    new App(root);
}