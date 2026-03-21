import { Router } from 'express';
import {
  createVehicle,
  deleteVehicle,
  getVehicle,
  listVehicles,
  purchaseVehicle,
  updateVehicle
} from '../controllers/vehicles.controller';
import { authenticate } from '../middlewares/auth';

const vehiclesRouter = Router();

vehiclesRouter.get('/', listVehicles);
vehiclesRouter.get('/:id', getVehicle);
vehiclesRouter.post('/', createVehicle);
vehiclesRouter.put('/:id', updateVehicle);
vehiclesRouter.post('/:id/purchase', authenticate, purchaseVehicle);
vehiclesRouter.delete('/:id', deleteVehicle);

export default vehiclesRouter;
