import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import TimeSlider from '@arcgis/core/widgets/TimeSlider';
import pointData from '../../stores/pointData';
import styles from './Timeline.module.css';
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import MapAnimation from './MapAnimation';
import TimeInterval from '@arcgis/core/time/TimeInterval';
import state from '../../stores/state';
import { getView } from '../Map/view';
import SunLighting from '@arcgis/core/views/3d/environment/SunLighting';
import { formatDate, formatTime } from '../../utils';
import '@esri/calcite-components/dist/components/calcite-icon';
import '@esri/calcite-components/dist/components/calcite-fab';
import '@esri/calcite-components/dist/components/calcite-label';
import '@esri/calcite-components/dist/components/calcite-switch';

const timeStep = 100; // milliseconds

export const Timeline = observer(() => {
    const { dataLoaded, timeDates, coordinates } = pointData;
    const { viewLoaded } = state;
    const [currentTime, setCurrentTime] = useState<Date>();
    const timelineRef = useRef<HTMLDivElement>(null);
    const timesliderRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const isAnimatingRef = useRef<boolean>(false);
    const isFollowingRef = useRef<boolean>(false);
    const mapAnimationRef = useRef(null);
    const viewRef = useRef<__esri.SceneView>(null);

    const updateVisualization = (time: Date) => {
        mapAnimationRef.current.update(time, isFollowingRef.current);
        (viewRef.current.environment.lighting as SunLighting).date = time;
        setCurrentTime(time);
        if (isAnimatingRef.current) {
            requestAnimationFrame(() => {
                let currentTime = new Date(timesliderRef.current.timeExtent.end.getTime() + timeStep);
                if (currentTime >= timesliderRef.current.fullTimeExtent.end) {
                    currentTime = timeDates[0];
                }
                updateVisualization(currentTime);
            })
        }
    };

    useEffect(() => {
        if (timesliderRef.current) {
            timesliderRef.current.timeExtent.end = currentTime;
        }
    }, [currentTime]);

    useEffect(() => {
        if (timelineRef.current && dataLoaded && viewLoaded) {
            const view = getView();
            viewRef.current = view;
            let watchHandler: IHandle = null;
            timesliderRef.current = new TimeSlider({
                fullTimeExtent: {
                    start: timeDates[0],
                    end: timeDates[timeDates.length - 1]
                },
                timeVisible: false,
                stops: {
                    interval: new TimeInterval({
                        value: 15,
                        unit: "minutes"
                    })
                },
                mode: "cumulative-from-start",
                container: timelineRef.current
            });
            mapAnimationRef.current = new MapAnimation({ coordinates, timeDates, view });

            watchHandler = reactiveUtils.watch(() => timesliderRef.current.timeExtent, (timeExtent) => {
                setIsAnimating(false);
                const time = timeExtent.end;
                updateVisualization(time);
            });

            return () => {
                watchHandler.remove();
            }
        }
    }, [timelineRef.current, dataLoaded, viewLoaded]);

    useEffect(() => {
        isAnimatingRef.current = isAnimating;
        if (isAnimating) {
            let currentTime = new Date(timesliderRef.current.timeExtent.end.getTime() + timeStep);
            if (currentTime >= timesliderRef.current.fullTimeExtent.end) {
                currentTime = timeDates[0];
            }
            updateVisualization(currentTime);
        }
    }, [isAnimating]);


    return (<div className={styles.menu}>
        {currentTime && <div className={styles.time}>
            <calcite-fab style={{ transform: 'scale(1.5)', pointerEvents: 'all' }} onClick={() => { setIsAnimating(!isAnimating) }} scale={"l"} icon={isAnimating ? "pause-f" : "play-f"} kind="brand"></calcite-fab>
            <div>
                <div className={styles.date}>{formatDate(currentTime.getTime())}</div>
                <div className={styles.hours}>{formatTime(currentTime)}</div>
            </div>
            <div className={styles.followMode}><calcite-label layout="inline">Follow bird
                <calcite-switch oncalciteSwitchChange={(evt) => {
                    const value = evt.target.checked;
                    isFollowingRef.current = value;
                }}></calcite-switch>
                </calcite-label></div>
        </div>}
        <div className={styles.container} ref={timelineRef}></div>
    </div>);
});