import { addToCart, getMyCart,clearCart } from '@/controller';
import { Router } from 'express';

const router = Router();

router.post('/cart/add-to-cart', (req, res, next) => {
  addToCart(req, res, next);
});
router.get('/cart/me', (req, res, next) => {
  getMyCart(req, res, next);
});

router.get('/cart/clear', (req, res, next) => {
  clearCart(req, res, next);
});

export default router;

