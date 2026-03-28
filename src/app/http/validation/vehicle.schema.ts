import { z } from "zod";

const stringField = (field: string) =>
  z.string().trim().min(1, `${field} não pode ser vazio`);

const numberField = (field: string) =>
  z.number().finite(`${field} deve ser um número válido`);

const booleanField = (field: string) => z.boolean().default(false);

export const vehicleCreateSchema = z.object({
  brand: stringField("brand"),
  model: stringField("model"),
  color: stringField("color"),
  year: numberField("year"),
  price: numberField("price"),
  isSold: booleanField("isSold"),
});

export const vehicleCreatePayloadSchema = z.union([
  vehicleCreateSchema,
  z.array(vehicleCreateSchema).min(1, "Envie ao menos um veículo para cadastro"),
]);

export const vehicleUpdateSchema = vehicleCreateSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  {
    message: "Informe ao menos um campo para atualizar",
  }
);

export type VehicleCreateInput = z.infer<typeof vehicleCreateSchema>;
export type VehicleCreatePayload = z.infer<typeof vehicleCreatePayloadSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;
