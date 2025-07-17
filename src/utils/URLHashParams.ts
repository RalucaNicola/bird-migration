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

enum Keys {
    Center = 'mapCenter'
}

interface Center {
    lon: number;
    lat: number;
}

const hashParams = new URLSearchParams(window.location.hash.slice(1));

const updateHashParams = (key: Keys, value: string) => {
    if (value === undefined || value === null) {
        hashParams.delete(key);
    } else {
        hashParams.set(key, value);
    }
    window.location.hash = hashParams.toString();
};

const getHashParamValueByKey = (key: Keys) => {
    if (!hashParams.has(key)) {
        return null;
    }

    return hashParams.get(key);
};

export const setMapCenterToHashParams = (center: Center, zoom: number) => {
    const { lon, lat } = center;
    const value = `${lon},${lat},${zoom}`;

    updateHashParams(Keys.Center, value);
};

export const getMapCenterFromHashParams = () => {
    const value = getHashParamValueByKey(Keys.Center);

    if (!value) {
        return null;
    }

    const [lon, lat, zoom] = value.split(',').map((d) => parseFloat(d));

    return {
        center: {
            lon,
            lat
        },
        zoom
    };
};