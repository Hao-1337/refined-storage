export declare class DynamicPropertyDB {
    id: string;
    data: {
        [key: string]: string;
    };
    constructor(id: string);
    init(): void;
}
