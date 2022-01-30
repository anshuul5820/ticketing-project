import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@ticketing-common-lib05/common'
import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { Order } from '../models/order'
import { stripe } from '../stripe'

const router = express.Router()

router.post('/api/payments',
    requireAuth,
    [
        body('token')
            .not()
            .isEmpty(),
        body('orderId')
            .not()
            .isEmpty()
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body
        const order = await Order.findById(orderId)

        if (!order)
            throw new NotFoundError()

        if (order.userId !== req.currentUser?.id)
            throw new NotAuthorizedError()

        if (order.status === OrderStatus.Cancelled)
            throw new BadRequestError('you cant pay for a cancelled order')

        await stripe.charges.create({
            currency: 'usd',
            amount: order.price * 100,//stripe uses cents, not $
            source: token
        })
        res.send({ success: true })
    })

export { router as createChargeRouter }