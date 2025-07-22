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

import PortalItem from "@arcgis/core/portal/PortalItem";
import { mapConfig } from "../../config";
import state from "../../stores/state";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import { getMapCenterFromHashParams, setMapCenterToHashParams } from "../../utils/URLHashParams";
import SceneView from "@arcgis/core/views/SceneView";
import Map from "@arcgis/core/Map";
import pointData from "../../stores/pointData";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
let view: __esri.SceneView = null;

const listeners: IHandle[] = [];

export function getView() {
    return view;
}

export function destroyView() {
    if (view) {
        listeners.forEach(listener => listener.remove());
        view.destroy();
        view = null;
    }
}

export const initializeView = async (divRef: HTMLDivElement) => {
    try {

        view = new SceneView({
            container: divRef,
            map: new Map({
                basemap: "satellite",
                ground: "world-elevation"
            }),
            qualityProfile: "high",
            //@ts-ignore
            qualitySettings: {
                bloom: true
            },
            popup: {
                dockEnabled: true,
                dockOptions: {
                    buttonEnabled: false,
                    breakpoint: false
                },
                highlightEnabled: false,
                defaultPopupTemplateEnabled: false
            }
        });

        (window as any).view = view;

        await view.when(async () => {
            state.setViewLoaded();
            pointData.initialize();
            const labels = new SceneLayer({
                url: "https://basemaps3d.arcgis.com/arcgis/rest/services/OpenStreetMap3D_LightLabels_v1/SceneServer/",
                definitionExpression: "Type >= 7"
            });
            view.map.add(labels);
        });
    } catch (error) {
        const { name, message } = error;
        state.setError({ name, message });
    }
};
