import moment from "moment";

export const formatDate = (date: Date | string, format: string = "YYYY-MM-DD HH:mm"): string => {
    return moment(date).format(format);
};

export const getCurrentDate = (format: string = "YYYY-MM-DD HH:mm"): string => {
    return moment().format(format);
};

export const addTimeToDate = (date: Date | string, amount: number, unit: moment.unitOfTime.DurationConstructor = "days"): string => {
    return moment(date).add(amount, unit).format("YYYY-MM-DD HH:mm");
};

export const subtractTimeFromDate = (date: Date | string, amount: number, unit: moment.unitOfTime.DurationConstructor = "days"): string => {
    return moment(date).subtract(amount, unit).format("YYYY-MM-DD HH:mm");
};

export const getStartOf = (unit: moment.unitOfTime.StartOf): string => {
    return moment().startOf(unit).format("YYYY-MM-DD HH:mm");
};

export const getEndOf = (unit: moment.unitOfTime.StartOf): string => {
    return moment().endOf(unit).format("YYYY-MM-DD HH:mm");
};

export const formatPrettyDate = (date: Date | string): string => {
    return moment(date).format("LL");
};

export const formatPrettyDateWithTime = (date: Date | string): string => {
    return moment(date).format("LLL");
};
