import type { Measurement } from "./types";
import dayjs from "dayjs";

const groupByWeekDay = (measurements: Measurement[]) => {
  const grouped = measurements.reduce((acc, measurement) => {
    const day = dayjs(measurement.timestamp).format('YYYY-MM-DD');
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(measurement);
    return acc;
  }, {} as Record<string, Measurement[]>);

  return Object.keys(grouped).map(day => ({
    day,
    measurements: grouped[day]
  }));
};

export { groupByWeekDay };
