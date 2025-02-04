import { checkout, getOrderById, getOrders } from '@/controller';
import { Router } from 'express';

const router = Router();

router.post('/orders/checkout', (req, res, next) => {
  checkout(req, res, next);
});

router.get('/orders', (req, res, next) => {
  getOrders(req, res, next);
});

router.get('/orders/:id', (req, res, next) => {
  getOrderById(req, res, next);
});

export default router;

