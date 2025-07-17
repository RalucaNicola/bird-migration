import { Polyline, SpatialReference } from "@arcgis/core/geometry";
import Graphic from "@arcgis/core/Graphic";
import { getView } from "../Map/view";
import { interpolate } from "../../utils/interpolation";
import { LineSymbol3D, LineSymbol3DLayer } from "@arcgis/core/symbols";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

type LineAnimationParams = {
    coordinates: number[][]; 
    timeDates: Date[];
};

class LineAnimation {
    coordinates: number[][];
    timeDates: Date[];
    timesBetweenVertices: number[];
    graphic: Graphic = null;

    constructor({ coordinates, timeDates }: LineAnimationParams) {
        this.coordinates = coordinates;
        this.timeDates = timeDates;
        // Calculate time differences in milliseconds between consecutive dates
        this.timesBetweenVertices = this.timeDates.slice(0, -1).map((date, i) => this.timeDates[i+1].getTime() - date.getTime());
        const view = getView();
        const animatedLineLayer = new GraphicsLayer({
            elevationInfo: {
                mode: "absolute-height",
            }
        });
        this.graphic = new Graphic({
            geometry: new Polyline({
                spatialReference: SpatialReference.WebMercator,
                hasZ: true,
                paths: []
            }),
            symbol: new LineSymbol3D({
                symbolLayers: [new LineSymbol3DLayer({
                    material: { color: [0, 255, 255, 1] },
                    cap: "round",
                    join: "round",
                    size: 2
                })]
            })
        });
        animatedLineLayer.add(this.graphic);
        view.map.add(animatedLineLayer);
    }

    updateGraphic(time: Date) {

        let i = 0;
        while (i < this.timeDates.length - 1 && time > this.timeDates[i + 1]) {
          i++;
        }
        const p1 = this.coordinates[i];
        const p2 = this.coordinates[i + 1];

        const point = interpolate(
          p1,
          p2,
          time.getTime() - this.timeDates[i].getTime(),
          this.timesBetweenVertices[i]
        );
        const paths = [
          this.coordinates.slice(0, i + 1).concat([point])
        ];
        const line = this.graphic.geometry.clone() as Polyline;
        line.paths = paths;
        this.graphic.geometry = line;
    }



}

export default LineAnimation;