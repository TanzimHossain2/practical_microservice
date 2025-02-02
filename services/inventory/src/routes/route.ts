import {
  createInventory,
  getInventoryById,
  getInventoryDetails,
  updateInventory,
} from '@/controller';
import { Router } from 'express';
const router = Router();

router.post('/inventories', (req, res, next) => {
  createInventory(req, res, next);
});

router.put('/inventories/:id', (req, res, next) => {
  updateInventory(req, res, next);
});

router.get('/inventories/:id', (req, res, next) => {
  getInventoryById(req, res, next);
});

router.get('/inventories/:id/details', (req, res, next) => {
  getInventoryDetails(req, res, next);
});

export default router;
