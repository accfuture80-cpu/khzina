import { Vehicle } from './vehicle.entity';
export declare class Employee {
    id: number;
    code: string;
    name: string;
    jobTitle: string;
    department: string;
    linkedVehicle: Vehicle;
    isActive: boolean;
    createdAt: Date;
}
