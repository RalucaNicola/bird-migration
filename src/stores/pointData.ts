import { lngLatToXY } from "@arcgis/core/geometry/support/webMercatorUtils";
import { action, makeObservable, observable, runInAction } from "mobx";
import Papa from 'papaparse';

export interface BirdData {
    birdId: string,
    birdName: string,
    coordinates: number[][],
    timeDates: Date[]
}

class PointData {
    dataLoaded: boolean = false;
    data: BirdData[] = [];
    timeExtent: Date[] = [];

    constructor() {
        makeObservable(this, {
            dataLoaded: observable
        })
    }

    initialize() {
        Papa.parse('./data-processing/filtered_file.csv', {
            download: true, complete: (results) => {
                const dataWithoutHeader = results.data.slice(1) as string[];
                dataWithoutHeader.forEach(d => {
                    const birdId = d[6];
                    if (birdId) {
                        let bird = this.data.find(b => b.birdId === birdId);
                        if (!bird) {
                            bird = {
                                birdId,
                                birdName: d[7] || "",
                                coordinates: [],
                                timeDates: []
                            };
                            this.data.push(bird);
                        }
                        if (parseFloat(d[2]) && parseFloat(d[3])) {
                            const [x, y] = lngLatToXY(parseFloat(d[2]), parseFloat(d[3]));
                            bird.coordinates.push([x, y, parseFloat(d[4]) || 0]);
                            bird.timeDates.push(new Date(d[1]))
                        }
                    }

                });
                // Remove tracks with less than 5 coordinates;
                this.data = this.data.filter(d => d.coordinates.length >= 5);
                const minDates = this.data.map(d => d.timeDates[0].getTime())
                const maxDates = this.data.map(d => d.timeDates[d.timeDates.length - 1].getTime());
                this.timeExtent = [
                    new Date(Math.min(...minDates)),
                    new Date(Math.max(...maxDates))
                ];
                console.log(this.data);
                runInAction(() => {
                    this.dataLoaded = true;
                })
            }
        });
    }
}

const pointData = new PointData();
export default pointData;