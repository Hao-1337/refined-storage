import { Vector3 } from '@minecraft/server';
export type PathFinderGroup = (PathFinderGroup | Vector3[])[];
export declare class PathFinder {
    paths: Vector3[];
    group: PathFinderGroup;
    contructor(): void;
    protected init(): void;
}
