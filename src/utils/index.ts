/* Copyright 2025 Esri
 *
 * Licensed under the Apache License Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fadeLayer = (layer: __esri.Layer) => {
    const opacity = parseFloat((layer.opacity + 0.02).toFixed(2));
    layer.opacity = opacity;
    if (layer.opacity < 1) {
        window.requestAnimationFrame(function () {
            fadeLayer(layer);
        });
    }
};
export function fadeIn(layer: __esri.Layer) {
    layer.opacity = 0;
    if (!layer.visible) {
        layer.visible = true;
    }
    fadeLayer(layer);
}

export const roundNumber = (number: number, digits: number) => {
    return Number(number.toFixed(digits))
}

export const formatNumber = (number: number) => {
    return new Intl.NumberFormat("en-US").format(number);
};

export const formatDate = (time: number) => {
    const date = new Date(time);
    return new Intl.DateTimeFormat("en-US").format(date);
}

export const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    }).format(date);
};