import { addToCart, getMyCart } from '@/controller';
import { Router } from 'express';

const router = Router();

router.post('/cart/add-to-cart', (req, res, next) => {
  addToCart(req, res, next);
});
router.get('/cart/me', (req, res, next) => {
  getMyCart(req, res, next);
});

export default router;

