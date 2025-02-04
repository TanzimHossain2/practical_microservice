import { createProduct, getProductDetails, getProducts,updateProduct } from '@/controller';
import { Router } from 'express';

const router = Router();

router.post('/products', (req, res, next) => {
  createProduct(req, res, next);
});

router.get('/products', (req, res, next) => {
  getProducts(req, res, next);
});

router.get('/products/:id', (req, res, next) => {
  getProductDetails(req, res, next);
});

router.put('/products/:id', (req, res, next) => {
  updateProduct(req, res, next);
});



export default router;

