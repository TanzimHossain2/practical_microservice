
import { Router } from 'express';

const router = Router();

router.post('/', (req, res, next) => {
  res.send('Hello World');
});

export default router;

