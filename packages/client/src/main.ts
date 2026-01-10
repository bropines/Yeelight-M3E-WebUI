import './style.css';
import '@m3e/theme';
import '@m3e/card';
import '@m3e/button';
import '@m3e/icon';
import '@m3e/icon-button';
import '@m3e/slider';
import '@m3e/switch';
import '@m3e/segmented-button';
import '@m3e/fab'; 
import '@m3e/dialog';      // <-- NEW
import '@m3e/form-field';  // <-- NEW (для ввода имени)

import { App } from './components/App';

const root = document.getElementById('app');
if (root) {
    new App(root);
}