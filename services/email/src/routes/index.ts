import { getEmails, sendEmail } from '@/controller';
import { Router } from 'express';

const router = Router();

router.post('/emails/send', (req, res, next) => {
  sendEmail(req, res, next);
});

router.get('/emails', (req, res, next) => {
  getEmails(req, res, next);
});

export default router;

