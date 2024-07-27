declare module '@minecraft/server' {
    interface Block {
        setAir(): void;
        commandSetAir(): CommandResult;
        break(): CommandResult;
        container(): Container | undefined;
        itemAt(slot: number): ContainerSlot | undefined;
    }
    interface Container {
        emptyWith(item: ItemStack): number;
    }
    interface ContainerSlot {
        stack(item: ItemStack): ItemStack | undefined;
    }
    interface Player {
        getDirection(inverse?: boolean): Direction;
        getDirection2D(): Direction;
        getFacingDirection2D(): Direction;
    }
    interface World {
        debug(data: unknown, option?: EntityQueryOptions): void | never;
    }
}
declare global {
    interface Array<T> {
        megresplice(): Array<T>;
    }
    interface JSON {
        colorStringify(data: unknown, space?: number): string;
    }
}
export type JsonStringResult = {
    [key: string]: string | JsonStringResult;
};
export declare function JsonString(d: any): JsonStringResult;
