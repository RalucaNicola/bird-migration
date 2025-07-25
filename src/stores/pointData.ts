import { lngLatToXY } from "@arcgis/core/geometry/support/webMercatorUtils";
import { action, makeObservable, observable, runInAction } from "mobx";
import Papa from 'papaparse';

class PointData {
    dataLoaded: boolean = false;
    coordinates: number[][] = [];
    timeDates: Date[] = [];

    constructor() {
        makeObservable(this, {
            dataLoaded: observable
        })
    }

    initialize() {
        Papa.parse('./hbCH_all.csv', {
            download: true, complete: (results) => {
                const coords: number[][] = [];
                const timeDates: Date[] = [];
                const dataWithoutHeader = results.data.slice(1) as string[];
                dataWithoutHeader.forEach(d => {
                    if (parseFloat(d[3]) && parseFloat(d[4])) {
                        const [x, y] = lngLatToXY(parseFloat(d[3]), parseFloat(d[4]));
                        coords.push([parseFloat(x.toFixed(3)), parseFloat(y.toFixed(3)), parseInt(d[23]) || 0]);
                        timeDates.push(new Date(d[2]))
                    }
                });
                runInAction(() => {
                    this.coordinates = coords.slice(30000);
                    this.timeDates = timeDates.slice(30000);
                    this.dataLoaded = true;
                })
            }
        });
    }
}

const pointData = new PointData();
export default pointData;