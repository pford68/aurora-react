export type Measurements = {
    width: number,
    height: number
};

export type Person = {
    firstName: string,
    lastName: string,
    amount: number,
    lastUpdated: number,
    active: boolean,
    age: number,
    measurements: Measurements,
};