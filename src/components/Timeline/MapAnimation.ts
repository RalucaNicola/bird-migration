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
    isFollowing: boolean = null;

    constructor({ coordinates, timeDates, view }: MapAnimationParams) {
        this.coordinates = coordinates;
        this.timeDates = timeDates;
        // Calculate time differences in milliseconds between consecutive dates to use it in the interpolation
        this.timesBetweenVertices = this.timeDates.slice(0, -1).map((date, i) => this.timeDates[i + 1].getTime() - date.getTime());
        this.view = view;
        this.initializeLineGraphic();
        this.initializeBirdGraphic();

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
            "./assets/flying_crow_color.glb", { vertexSpace: "local" })).scale(10);
        await birdMesh.load();
        this.initialTransform = birdMesh.transform?.clone();
        const heading = getHeading(origin, nextLocation);
        birdMesh.rotate(0, 0, heading);

        this.birdGraphic = new Graphic({
            geometry: birdMesh,
            symbol: new MeshSymbol3D({
                symbolLayers: [new FillSymbol3DLayer()]
            })
        });

        this.view.graphics.add(this.birdGraphic);
        return birdMesh;
    }

    update(time: Date, isFollowing: boolean) {

        let i = 0;
        while (i < this.timeDates.length - 1 && time > this.timeDates[i + 1]) {
            i++;
        }
        
        const p1 = this.coordinates[i];
        const p2 = this.coordinates[i + 1];
        const p = interpolate(
            p1,
            p2,
            time.getTime() - this.timeDates[i].getTime(),
            this.timesBetweenVertices[i]
        );

        const point = [parseFloat(p[0].toFixed(3)), parseFloat(p[1].toFixed(3)), parseFloat(p[2].toFixed(3))];
        const [x, y, z] = point;
        const meshOrigin = new Point({ x, y, z, spatialReference: SpatialReference.WebMercator });
        const heading = getHeading(p1, point);
        this.updateLine(point, i);
        this.updateBirdGraphic(meshOrigin, heading);
        if (isFollowing) {
            this.updateCamera(heading);
        }
       
    }

    async updateCamera(heading: number) {
        if (this.birdGraphic) {
            const birdMesh = this.birdGraphic.geometry as Mesh;
            // const mesh = new Mesh({
            //     spatialReference: birdMesh.spatialReference,
            //     vertexSpace: birdMesh.vertexSpace,
            //     vertexAttributes: {
            //         position: [0, -30, 10]
            //     } as any
            // });
            // mesh.centerAt(birdMesh.origin);
            // mesh.rotate(0, 0, birdMesh.transform.rotationAngle);

            // const cameraMesh = await meshUtils.convertVertexSpace(
            //     mesh,
            //     new MeshGeoreferencedVertexSpace()
            // );

            const x = birdMesh.origin.x - 15 * Math.sin(heading * Math.PI / 180);
            const y = birdMesh.origin.y - 15 * Math.cos(heading * Math.PI / 180);
            const z = birdMesh.origin.z + 10;

            this.view.camera = new Camera({
                position: new Point({
                    spatialReference: birdMesh.spatialReference,
                    x,
                    y,
                    z,
                }),
                heading,
                tilt: 60,
                fov: 105,
            });
        }
    }

    updateLine(point: number[], i: number) {
        const paths = [
            this.coordinates.slice(0, i + 1).concat([point])
        ];
        const line = this.lineGraphic.geometry.clone() as Polyline;
        line.paths = paths;
        this.lineGraphic.geometry = line;
    }

    updateBirdGraphic(origin: Point, heading: number) {

        if (this.birdGraphic) {
            const birdMesh = this.birdGraphic.geometry as Mesh;
            birdMesh.centerAt(origin);
            console.log(origin.x, origin.y, origin.z);
            birdMesh.transform = this.initialTransform?.clone();
            birdMesh.rotate(0, 0, -heading);
        }

    }

}

export default MapAnimation;