import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import type { treeifyError } from 'zod';
import { VehicleAttributes } from '../../../domain/vehicles/entities/vehicle';
import { VehicleStatusFilter } from '../../services/vehicles.service';

export interface VehicleParams extends ParamsDictionary {
  id: string;
}

export interface VehicleQuery extends ParsedQs {
  status?: VehicleStatusFilter;
}

export type VehicleDTO = VehicleAttributes & { id: string };

export interface VehiclesListResponse {
  total: number;
  data: VehicleDTO[];
}

type ValidationErrorTree = ReturnType<typeof treeifyError>;

export interface ValidationErrorPayload {
  message: string;
  errors: ValidationErrorTree;
}
