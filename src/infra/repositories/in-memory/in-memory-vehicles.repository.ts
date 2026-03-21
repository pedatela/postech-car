import { Vehicle } from '../../../domain/vehicles/entities/vehicle';
import { VehiclesRepository } from '../../../domain/vehicles/repositories/vehicles-repository';

export class InMemoryVehiclesRepository implements VehiclesRepository {
  private vehicles: Vehicle[] = [];

  async list(): Promise<Vehicle[]> {
    return [...this.vehicles];
  }

  async findById(id: string): Promise<Vehicle | null> {
    return this.vehicles.find((vehicle) => vehicle.id === id) ?? null;
  }

  async create(vehicle: Vehicle): Promise<void> {
    this.vehicles.push(vehicle);
  }

  async update(vehicle: Vehicle): Promise<void> {
    const idx = this.vehicles.findIndex((item) => item.id === vehicle.id);

    if (idx === -1) {
      throw new Error('Veículo não encontrado');
    }

    this.vehicles[idx] = vehicle;
  }

  async delete(id: string): Promise<Vehicle | null> {
    const idx = this.vehicles.findIndex((vehicle) => vehicle.id === id);

    if (idx === -1) {
      return null;
    }

    const [removed] = this.vehicles.splice(idx, 1);
    return removed ?? null;
  }
}
