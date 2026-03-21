import { VehiclesService } from '../services/vehicles.service';
import { VehiclesRepository } from '../../domain/vehicles/repositories/vehicles-repository';
import { InMemoryVehiclesRepository } from '../../infra/repositories/in-memory/in-memory-vehicles.repository';

export const createVehiclesService = (
  repository: VehiclesRepository = new InMemoryVehiclesRepository()
): VehiclesService => new VehiclesService(repository);
