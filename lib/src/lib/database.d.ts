export declare class DynamicPropertyDB {
    static chunkLength: number;
    id: string;
    data: {
        [key: string]: string;
    };
    constructor(id: string);
    private split;
    init(): void;
}
