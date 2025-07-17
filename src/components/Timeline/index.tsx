import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import TimeSlider from '@arcgis/core/widgets/TimeSlider';
import pointData from '../../stores/pointData';
import styles from './Timeline.module.css';
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import LineAnimation from './animation';
import TimeInterval from '@arcgis/core/time/TimeInterval';
import state from '../../stores/state';
import { getView } from '../Map/view';
import SunLighting from '@arcgis/core/views/3d/environment/SunLighting';
import { formatDate, formatTime } from '../../utils';

export const Timeline = observer(() => {
    const { dataLoaded, timeDates, coordinates } = pointData;
    const { viewLoaded } = state;
    const [currentTime, setCurrentTime] = useState<Date>();
    const timelineRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (timelineRef.current && dataLoaded && viewLoaded) {
            const view = getView();
            const timeslider = new TimeSlider({
                fullTimeExtent: {
                    start: timeDates[40000],
                    end: timeDates[70000]
                },
                playRate: 100,
                stops: {
                    interval: new TimeInterval({
                        value: 5,
                        unit: "minutes"
                    })
                },
                mode: "cumulative-from-start",
                container: timelineRef.current
            });
            const lineAnimation = new LineAnimation({ coordinates, timeDates });
            reactiveUtils.watch(() => timeslider.timeExtent, (timeExtent) => {
                const time = timeExtent.end;
                lineAnimation.updateGraphic(time);
                (view.environment.lighting as SunLighting).date = time;
                setCurrentTime(time);
            })
        }
    }, [timelineRef.current, dataLoaded, viewLoaded]);
    return (<>
        {currentTime && <div className={styles.time}>
            <div className={styles.date}>{formatDate(currentTime.getTime())}</div>
            <div className={styles.hours}>{formatTime(currentTime)}</div>
        </div>
        }
        <div className={styles.container} ref={timelineRef}></div>
    </>);
});