import { Datapoint, TDatapoint, IngestionTransformationFn, ValuesTransformationFn } from "./types";

export class IngestionTransformations {

    static applyTransformations(transformations: IngestionTransformationFn[], datapoint: TDatapoint, prevDatapoint?: TDatapoint) {
        return transformations.reduce((cur, transformation) => transformation(cur, prevDatapoint), datapoint);
    }

    static counter(cur: Datapoint<number>, prev?: [number, number, number]): [number | undefined, number, number] {
        // datapoint: [value, timestamp]
        // for counters, we use [rate, timestamp, original value]
        // first rate of the counter is undefined, to be filtered by Datastore#queryMetric()
        if (prev) {
            const deltaSec = (cur[1] - prev[1]) / 1000;
            return [(cur[0] - prev[2]!) / deltaSec, cur[1], cur[0]];
        }
        else {
            return [undefined, cur[1], cur[0]];
        }
    }

}

export class ValuesTransformations {

    static applyTransformations(transformations: ValuesTransformationFn[], datapoints: TDatapoint[]) {
        datapoints.sort((a: TDatapoint, b: TDatapoint) => a[1] - b[1]);
        transformations.forEach(transformation => transformation(datapoints));
        return datapoints;
    }

    static counter(datapoints: Datapoint<number>[]) {
        // for counters we need at least 2 values to get the rate
        if (datapoints.length < 2)
            datapoints.length = 0;

        let prev = datapoints[0];
        for (let i = 1; i < datapoints.length; i++) {
            let cur = datapoints[i].slice() as Datapoint<number>; // copy datapoint
            const deltaSec = (cur[1] - prev[1]) / 1000;
            datapoints[i][0] = (cur[0] - prev[0]) / deltaSec;
            prev = cur;
        }
        datapoints.shift(); // remove first value of the counter (not possible to calculate rate)
    }

}
