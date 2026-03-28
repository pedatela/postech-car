import { Vehicle, VehicleAttributes } from '../../domain/vehicles/entities/vehicle';
import { VehiclesRepository } from '../../domain/vehicles/repositories/vehicles-repository';
import { logger } from '../logger';

export type VehicleStatusFilter = 'available' | 'sold';

export interface VehicleListFilter {
  status?: VehicleStatusFilter;
}

export class VehicleAlreadySoldError extends Error {
  constructor() {
    super('Veículo já foi vendido');
    this.name = 'VehicleAlreadySoldError';
  }
}

export class VehiclesService {
  constructor(private readonly repository: VehiclesRepository) {}

  async list(filter?: VehicleListFilter): Promise<Vehicle[]> {
    logger.info('Listando veículos', { filter: filter ?? null });
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
    logger.info('Buscando veículo por ID', { id });
    const vehicle = await this.repository.findById(id);

    if (!vehicle) {
      logger.warn('Veículo não encontrado', { id });
    }

    return vehicle;
  }

  async create(attrs: VehicleAttributes): Promise<Vehicle> {
    logger.info('Criando veículo', {
      brand: attrs.brand,
      model: attrs.model,
      year: attrs.year
    });
    const vehicle = Vehicle.create(attrs);
    await this.repository.create(vehicle);
    logger.info('Veículo criado', { id: vehicle.id });
    return vehicle;
  }

  async createMany(attrsList: VehicleAttributes[]): Promise<Vehicle[]> {
    logger.info('Criando múltiplos veículos', { total: attrsList.length });
    const created: Vehicle[] = [];

    for (const attrs of attrsList) {
      const vehicle = await this.create(attrs);
      created.push(vehicle);
    }

    logger.info('Criação em lote concluída', { total: created.length });
    return created;
  }

  async update(
    id: string,
    attrs: Partial<VehicleAttributes>
  ): Promise<Vehicle | null> {
    logger.info('Atualizando veículo', { id, attrs });
    const vehicle = await this.repository.findById(id);

    if (!vehicle) {
      logger.warn('Veículo para atualização não encontrado', { id });
      return null;
    }

    vehicle.update(attrs);
    await this.repository.update(vehicle);
    logger.info('Veículo atualizado', { id: vehicle.id });

    return vehicle;
  }

  async delete(id: string): Promise<Vehicle | null> {
    logger.info('Removendo veículo', { id });
    const removed = await this.repository.delete(id);

    if (!removed) {
      logger.warn('Veículo para remoção não encontrado', { id });
      return null;
    }

    logger.info('Veículo removido', { id: removed.id });
    return removed;
  }

  async purchase(id: string, buyerId: string): Promise<Vehicle | null> {
    logger.info('Processando compra', { vehicleId: id, buyerId });
    const vehicle = await this.repository.findById(id);

    if (!vehicle) {
      logger.warn('Veículo para compra não encontrado', { vehicleId: id });
      return null;
    }

    if (vehicle.isSold) {
      logger.warn('Tentativa de compra de veículo já vendido', { vehicleId: id });
      throw new VehicleAlreadySoldError();
    }

    vehicle.update({ isSold: true, buyerId });
    await this.repository.update(vehicle);
    logger.info('Compra concluída', { vehicleId: id, buyerId });

    return vehicle;
  }
}
