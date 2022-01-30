import express, { Request, Response } from 'express';
import { requireAuth } from '@ticketing-common-lib05/common';
import { Order } from '../models/order';

const router = express.Router();

//fetch order for a ticket
router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate('ticket');

  res.send(orders);
});

export { router as indexOrderRouter };
