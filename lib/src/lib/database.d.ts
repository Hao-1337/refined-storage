export declare class DynamicPropertyDB {
    static chunkLength: number;
    id: string;
    data: {
        [key: string]: any;
    };
    keys: {
        [key: string]: number[];
    };
    constructor(id: string);
    init(): void;
    set(key: string, data: any): boolean;
    get(key: string): any | undefined;
    update(key: string, data: any): boolean;
    clear(key: string): boolean;
    has(key: string): boolean;
    [Symbol.iterator](): [string, any][];
    moveTo(key: string, other: DynamicPropertyDB): boolean;
    push(): void;
    private split;
    private parse;
}
