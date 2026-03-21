import { Router } from 'express';
import {
  createVehicle,
  deleteVehicle,
  getVehicle,
  listVehicles,
  updateVehicle
} from '../controllers/vehicles.controller';

const vehiclesRouter = Router();

vehiclesRouter.get('/', listVehicles);
vehiclesRouter.get('/:id', getVehicle);
vehiclesRouter.post('/', createVehicle);
vehiclesRouter.put('/:id', updateVehicle);
vehiclesRouter.delete('/:id', deleteVehicle);

export default vehiclesRouter;
