import { createInventory, updateInventory,getInventoryById,getInventoryDetails } from '@/controller';
import { Router } from 'express';
const router = Router();

router.post('/inventories', createInventory);
router.put('/inventories/:id', updateInventory);
router.get('/inventories/:id', getInventoryById);
router.get('/inventories/:id/details', getInventoryDetails);


export default router;

