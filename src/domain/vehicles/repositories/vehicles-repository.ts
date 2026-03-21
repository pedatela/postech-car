import { Vehicle } from '../entities/vehicle';

export interface VehiclesRepository {
  list(): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  create(vehicle: Vehicle): Promise<void>;
  update(vehicle: Vehicle): Promise<void>;
  delete(id: string): Promise<Vehicle | null>;
}
