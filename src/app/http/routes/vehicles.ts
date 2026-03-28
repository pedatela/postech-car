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
import { authorizeRole } from '../middlewares/authorize-role';
import { authConfig } from '../../../config/auth';

const vehiclesRouter = Router();
const sellerRole = authConfig.sellerRole ?? 'seller';

vehiclesRouter.get('/', listVehicles);
vehiclesRouter.get('/:id', getVehicle);
vehiclesRouter.post('/', authenticate, authorizeRole(sellerRole), createVehicle);
vehiclesRouter.put('/:id', authenticate, authorizeRole(sellerRole), updateVehicle);
vehiclesRouter.post('/:id/purchase', authenticate, purchaseVehicle);
vehiclesRouter.delete('/:id', authenticate, authorizeRole(sellerRole), deleteVehicle);

export default vehiclesRouter;
