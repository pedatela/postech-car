import { describe, it, expect, beforeEach } from 'vitest';
import { VehiclesService, VehicleAlreadySoldError } from '../src/app/services/vehicles.service';
import { InMemoryVehiclesRepository } from '../src/infra/repositories/in-memory/in-memory-vehicles.repository';
import { Vehicle, VehicleAttributes } from '../src/domain/vehicles/entities/vehicle';

const makeVehicle = (attrs: Partial<VehicleAttributes> = {}) =>
  Vehicle.create({
    brand: 'Tesla',
    model: 'Model 3',
    year: 2024,
    color: 'Blue',
    price: 250000,
    isSold: false,
    buyerId: null,
    ...attrs
  });

describe('VehiclesService', () => {
  let repository: InMemoryVehiclesRepository;
  let service: VehiclesService;

  beforeEach(() => {
    repository = new InMemoryVehiclesRepository();
    service = new VehiclesService(repository);
  });

  it('filters vehicles by status and orders available items by price', async () => {
    const vehicles = [
      makeVehicle({ price: 180000 }),
      makeVehicle({ price: 220000, isSold: true, buyerId: 'buyer-1' }),
      makeVehicle({ price: 80000 })
    ];

    for (const vehicle of vehicles) {
      await repository.create(vehicle);
    }

    const result = await service.list({ status: 'available' });

    expect(result).toHaveLength(2);
    expect(result[0].price).toBe(80000);
    expect(result[1].price).toBe(180000);
  });

  it('marks vehicles as sold and assigns buyer during purchase', async () => {
    const vehicle = makeVehicle();
    await repository.create(vehicle);

    const buyerId = 'buyer-123';
    const updated = await service.purchase(vehicle.id, buyerId);

    expect(updated).not.toBeNull();
    expect(updated?.isSold).toBe(true);
    expect(updated?.buyerId).toBe(buyerId);

    const stored = await repository.findById(vehicle.id);
    expect(stored?.isSold).toBe(true);
    expect(stored?.buyerId).toBe(buyerId);
  });

  it('throws when trying to purchase an already sold vehicle', async () => {
    const soldVehicle = makeVehicle({ isSold: true, buyerId: 'buyer-789' });
    await repository.create(soldVehicle);

    await expect(
      service.purchase(soldVehicle.id, 'buyer-123')
    ).rejects.toBeInstanceOf(VehicleAlreadySoldError);
  });

  it('returns null when updating a non-existent vehicle', async () => {
    const response = await service.update('missing-id', { color: 'Black' });
    expect(response).toBeNull();
  });

  it('creates multiple vehicles at once', async () => {
    const payload = [
      {
        brand: 'Ford',
        model: 'Mustang',
        year: 2022,
        color: 'Red',
        price: 350000,
        isSold: false
      },
      {
        brand: 'Chevrolet',
        model: 'Camaro',
        year: 2021,
        color: 'Yellow',
        price: 330000,
        isSold: false
      }
    ];

    const created = await service.createMany(payload);
    expect(created).toHaveLength(2);

    const stored = await repository.list();
    expect(stored).toHaveLength(2);
    expect(stored.map((vehicle) => vehicle.brand)).toContain('Ford');
    expect(stored.map((vehicle) => vehicle.brand)).toContain('Chevrolet');
  });
});
