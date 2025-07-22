import { Polyline, SpatialReference } from "@arcgis/core/geometry";
import Graphic from "@arcgis/core/Graphic";
import { interpolate } from "../../utils/interpolation";
import { LineSymbol3D, LineSymbol3DLayer } from "@arcgis/core/symbols";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { BirdData } from "../../stores/pointData";

type MapAnimationParams = {
    data: BirdData[];
    view: __esri.SceneView;
};

type GetSymbolParams = {
    color: string;
    draped: boolean;
};

const getSymbol = ({ color, draped }: GetSymbolParams): LineSymbol3D => {
    if (draped) {
        return new LineSymbol3D({
            symbolLayers: [new LineSymbol3DLayer({
                material: {
                    color
                },
                cap: "round",
                join: "round",
                size: 1
            })]
        })
    } else {
        return new LineSymbol3D({
            symbolLayers: [new LineSymbol3DLayer({
                material: {
                    color,
                    //@ts-ignore
                    emissive: {
                        strength: 3,
                        source: "color"
                    }
                },
                cap: "round",
                join: "round",
                size: 1
            })]
        });
    }
};


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
        this.addDrapedLines();
    }

    initializeLineGraphics() {
        const animatedLineLayer = new GraphicsLayer({
            elevationInfo: {
                mode: "absolute-height",
                offset: 10000
            }
        });
        this.lineGraphics = this.data.map(d => new Graphic({
            geometry: new Polyline({
                spatialReference: SpatialReference.WebMercator,
                hasZ: true,
                paths: []
            }),
            symbol: getSymbol({ color: d.birdColor, draped: false }),
            attributes: {
                birdId: d.birdId
            }
        }));
        animatedLineLayer.addMany(this.lineGraphics);
        this.view.map.add(animatedLineLayer);
    }

    addDrapedLines() {
        const drapedLineLayer = new GraphicsLayer({
            elevationInfo: {
                mode: "on-the-ground"
            }
        });
        const drapedLineGraphics = this.data.map(d => new Graphic({
            geometry: new Polyline({
                spatialReference: SpatialReference.WebMercator,
                hasZ: true,
                paths: [d.coordinates]
            }),
            symbol: getSymbol({color: d.birdColor, draped: true})
        }));
        drapedLineLayer.addMany(drapedLineGraphics);
        this.view.map.add(drapedLineLayer);
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

        const prev24 = new Date(time.getTime() - 24 * 60 * 60 * 1000);
        let j = 0;
        while (j < timeDates.length - 1 && prev24 > timeDates[j + 1]) {
            j++;
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
                coordinates.slice(j, i + 1).concat([point])
            ];
            const line = lineGraphic.geometry.clone() as Polyline;
            line.paths = paths;
            lineGraphic.geometry = line;
        }

    }

}

export default MapAnimation;