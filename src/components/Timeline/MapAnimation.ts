import { Point, Polyline, SpatialReference } from "@arcgis/core/geometry";
import Graphic from "@arcgis/core/Graphic";
import { getView } from "../Map/view";
import { getHeading, interpolate } from "../../utils/interpolation";
import { FillSymbol3DLayer, LineSymbol3D, LineSymbol3DLayer, MeshSymbol3D } from "@arcgis/core/symbols";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Mesh from "@arcgis/core/geometry/Mesh";
import MeshTransform from "@arcgis/core/geometry/support/MeshTransform";

type MapAnimationParams = {
    coordinates: number[][];
    timeDates: Date[];
    view: __esri.SceneView;
};

class MapAnimation {
    coordinates: number[][];
    timeDates: Date[];
    timesBetweenVertices: number[];
    lineGraphic: Graphic = null;
    birdGraphic: Graphic = null;
    view: __esri.SceneView = null;
    initialTransform: __esri.MeshTransform = null;

    constructor({ coordinates, timeDates, view }: MapAnimationParams) {
        this.coordinates = coordinates;
        this.timeDates = timeDates;
        // Calculate time differences in milliseconds between consecutive dates to use it in the interpolation
        this.timesBetweenVertices = this.timeDates.slice(0, -1).map((date, i) => this.timeDates[i + 1].getTime() - date.getTime());
        this.view = view;
        this.initializeLineGraphic();
       // this.initializeBirdGraphic();
    }

    initializeLineGraphic() {
        const animatedLineLayer = new GraphicsLayer({
            elevationInfo: {
                mode: "absolute-height",
            }
        });
        this.lineGraphic = new Graphic({
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
        animatedLineLayer.add(this.lineGraphic);
        this.view.map.add(animatedLineLayer);
    }

    async initializeBirdGraphic() {

        const origin = this.coordinates[0];
        const nextLocation = this.coordinates[1];
        const birdMesh = (await Mesh.createFromGLTF(
            new Point({ x: origin[0], y: origin[1], z: origin[2], spatialReference: SpatialReference.WebMercator }),
            "./assets/flying_crow_color.glb")).scale(2);
        await birdMesh.load();
        this.initialTransform = birdMesh.transform?.clone();
        // const heading = getHeading(origin, nextLocation);
        // birdMesh.rotate(0, 0, heading);
        console.log("Bird mesh after transformation", birdMesh);

        this.birdGraphic = new Graphic({
            geometry: birdMesh,
            symbol: new MeshSymbol3D({
                symbolLayers: [new FillSymbol3DLayer()]
            })
        });

        this.view.graphics.add(this.birdGraphic);
    }

    update(time: Date) {

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
        this.updateLine(point, i);
        //this.updateBirdGraphic(point, p2);
    }

    updateCamera(time: Date) {

    }

    updateLine(point: number[], i: number) {
        const paths = [
            this.coordinates.slice(0, i + 1).concat([point])
        ];
        const line = this.lineGraphic.geometry.clone() as Polyline;
        line.paths = paths;
        this.lineGraphic.geometry = line;
    }

    updateBirdGraphic(point: number[], p2: number[]) {
        const [x, y, z] = point;
        const heading = getHeading(p2, point);

        if (this.birdGraphic) {
            const birdMesh = this.birdGraphic.geometry as Mesh;
            birdMesh.centerAt(new Point({ x, y, z, spatialReference: SpatialReference.WebMercator }));
            birdMesh.transform = this.initialTransform?.clone();
           birdMesh.rotate(0, 0, heading);
        }

    }

}

export default MapAnimation;