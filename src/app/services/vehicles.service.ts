import { Vehicle, VehicleAttributes } from '../../domain/vehicles/entities/vehicle';
import { VehiclesRepository } from '../../domain/vehicles/repositories/vehicles-repository';

export type VehicleStatusFilter = 'available' | 'sold';

export interface VehicleListFilter {
  status?: VehicleStatusFilter;
}

export class VehiclesService {
  constructor(private readonly repository: VehiclesRepository) {}

  async list(filter?: VehicleListFilter): Promise<Vehicle[]> {
    let vehicles = await this.repository.list();

    if (filter?.status) {
      vehicles = vehicles
        .filter((vehicle) =>
          filter.status === 'sold' ? vehicle.isSold : !vehicle.isSold
        )
        .sort((a, b) => a.price - b.price);
    }

    return vehicles;
  }

  async getById(id: string): Promise<Vehicle | null> {
    return this.repository.findById(id);
  }

  async create(attrs: VehicleAttributes): Promise<Vehicle> {
    const vehicle = Vehicle.create(attrs);
    await this.repository.create(vehicle);
    return vehicle;
  }

  async update(
    id: string,
    attrs: Partial<VehicleAttributes>
  ): Promise<Vehicle | null> {
    const vehicle = await this.repository.findById(id);

    if (!vehicle) {
      return null;
    }

    vehicle.update(attrs);
    await this.repository.update(vehicle);

    return vehicle;
  }

  async delete(id: string): Promise<Vehicle | null> {
    return this.repository.delete(id);
  }
}
