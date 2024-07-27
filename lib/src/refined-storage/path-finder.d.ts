import { Vector3 } from '@minecraft/server';
import { DynamicPropertyDB } from '../lib/database';
export type PathFinderGroup = (PathFinderGroup | Vector3[])[];
export declare class PathFinder {
    paths: Vector3[];
    group: PathFinderGroup;
    db: DynamicPropertyDB;
    contructor(): void;
    protected init(): void;
}
