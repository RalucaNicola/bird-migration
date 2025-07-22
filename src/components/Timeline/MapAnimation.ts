import { Point, Polyline, SpatialReference } from "@arcgis/core/geometry";
import Graphic from "@arcgis/core/Graphic";
import { getView } from "../Map/view";
import { getHeading, interpolate } from "../../utils/interpolation";
import { FillSymbol3DLayer, LineSymbol3D, LineSymbol3DLayer, MeshSymbol3D } from "@arcgis/core/symbols";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Mesh from "@arcgis/core/geometry/Mesh";
import MeshTransform from "@arcgis/core/geometry/support/MeshTransform";
import MeshGeoreferencedVertexSpace from "@arcgis/core/geometry/support/MeshGeoreferencedVertexSpace";
import * as meshUtils from "@arcgis/core/geometry/support/meshUtils";
import Camera from "@arcgis/core/Camera";
import { BirdData } from "../../stores/pointData";

type MapAnimationParams = {
    data: BirdData[];
    view: __esri.SceneView;
};

const lineSymbol = new LineSymbol3D({
    symbolLayers: [new LineSymbol3DLayer({
        material: { color: [0, 255, 255, 1] },
        cap: "round",
        join: "round",
        size: 2
    })]
});

class MapAnimation {
    data: BirdData[];
    lineGraphics: Graphic[] = [];
    birdGraphic: Graphic = null;
    view: __esri.SceneView = null;
    initialTransform: __esri.MeshTransform = null;
    isFollowing: boolean = null;

    constructor({ data, view }: MapAnimationParams) {
        this.data = data;
        this.view = view;
        this.initializeLineGraphics();
    }

    initializeLineGraphics() {
        const animatedLineLayer = new GraphicsLayer({
            elevationInfo: {
                mode: "on-the-ground",
            }
        });
        this.lineGraphics = this.data.map(d => new Graphic({
            geometry: new Polyline({
                spatialReference: SpatialReference.WebMercator,
                hasZ: true,
                paths: []
            }),
            symbol: lineSymbol,
            attributes: {
                birdId: d.birdId
            }
        }));
        animatedLineLayer.addMany(this.lineGraphics);
        this.view.map.add(animatedLineLayer);
    }

    update(time: Date) {
        this.lineGraphics.forEach(lineGraphic => {
            this.updateLine(lineGraphic, time);
        })
    }

    updateLine(lineGraphic: Graphic, time: Date) {

        const { coordinates, timeDates } = this.data.find(d => d.birdId === lineGraphic.attributes.birdId);
        let i = 0;
        while (i < timeDates.length - 1 && time > timeDates[i + 1]) {
            i++;
        }
        if (i < timeDates.length - 1) {
            const p1 = coordinates[i];
            const p2 = coordinates[i + 1];

            const point = interpolate(
                p1,
                p2,
                time.getTime() - timeDates[i].getTime(),
                timeDates[i + 1].getTime() - timeDates[i].getTime()
            );
            const paths = [
                coordinates.slice(0, i + 1).concat([point])
            ];
            const line = lineGraphic.geometry.clone() as Polyline;
            line.paths = paths;
            lineGraphic.geometry = line;
        }

    }

}

export default MapAnimation;