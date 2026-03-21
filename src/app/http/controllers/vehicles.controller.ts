import { Request, Response } from "express";
import { treeifyError, ZodError } from "zod";
import {
  Vehicle,
  VehicleAttributes,
} from "../../../domain/vehicles/entities/vehicle";
import { createVehiclesService } from "../../factories/vehicles.factory";
import {
  VehicleListFilter,
  VehicleStatusFilter,
} from "../../services/vehicles.service";
import {
  ValidationErrorPayload,
  VehicleDTO,
  VehicleParams,
  VehicleQuery,
  VehiclesListResponse,
} from "../interfaces/vehicles.interface";
import {
  vehicleCreateSchema,
  VehicleUpdateInput,
  vehicleUpdateSchema,
} from "../validation/vehicle.schema";

const vehiclesService = createVehiclesService();

const formatVehicle = (vehicle: Vehicle): VehicleDTO =>
  vehicle.toJSON() as VehicleDTO;

const formatValidationError = (error: ZodError): ValidationErrorPayload => ({
  message: "Payload inválido",
  errors: treeifyError(error),
});

const sanitizeUpdatePayload = (payload: VehicleUpdateInput) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as Partial<VehicleAttributes>;

const parseStatusFilter = (status?: string) => {
  if (!status) return undefined;

  const normalized = status.toLowerCase();
  if (normalized !== "available" && normalized !== "sold") {
    return null;
  }

  return normalized as VehicleStatusFilter;
};

export const listVehicles = async (req: Request, res: Response) => {
  const { status } = req.query as VehicleQuery;
  const filterStatus = parseStatusFilter(
    typeof status === "string" ? status : undefined
  );

  if (filterStatus === null) {
    return res.status(400).json({
      message: 'Parâmetro "status" inválido. Use "available" ou "sold".',
    });
  }

  const filter: VehicleListFilter | undefined = filterStatus
    ? { status: filterStatus }
    : undefined;
  const vehicles = await vehiclesService.list(filter);

  const payload: VehiclesListResponse = {
    total: vehicles.length,
    data: vehicles.map((vehicle) => formatVehicle(vehicle)),
  };

  return res.json(payload);
};

export const getVehicle = async (req: Request, res: Response) => {
  const { id } = req.params as VehicleParams;
  const vehicle = await vehiclesService.getById(id);

  if (!vehicle) {
    return res.status(404).json({ message: "Veículo não encontrado" });
  }

  return res.json(formatVehicle(vehicle));
};

export const createVehicle = async (req: Request, res: Response) => {
  const result = vehicleCreateSchema.safeParse(req.body ?? {});

  if (!result.success) {
    return res.status(400).json(formatValidationError(result.error));
  }

  const vehicle = await vehiclesService.create(result.data);

  return res.status(201).json(formatVehicle(vehicle));
};

export const updateVehicle = async (req: Request, res: Response) => {
  const { id } = req.params as VehicleParams;
  const result = vehicleUpdateSchema.safeParse(req.body ?? {});

  if (!result.success) {
    return res.status(400).json(formatValidationError(result.error));
  }

  const updates = sanitizeUpdatePayload(result.data);
  const vehicle = await vehiclesService.update(id, updates);

  if (!vehicle) {
    return res.status(404).json({ message: "Veículo não encontrado" });
  }

  return res.json(formatVehicle(vehicle));
};

export const deleteVehicle = async (req: Request, res: Response) => {
  const { id } = req.params as VehicleParams;
  const removed = await vehiclesService.delete(id);

  if (!removed) {
    return res.status(404).json({ message: "Veículo não encontrado" });
  }

  return res.json({
    message: "Veículo removido com sucesso",
    vehicle: formatVehicle(removed),
  });
};
