import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@ticketing-common-lib05/common'
import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import { Ticket } from '../models/ticket'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.put('/api/tickets/:id', requireAuth, [
    body('title')
        .not()
        .isEmpty()
        .withMessage('title is required'),
    body('price')
        .isFloat({ gt: 0 })
        .withMessage('price must be provided and should be > 0')
], validateRequest, async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket)
        throw new NotFoundError()

    //orderId!==undefined -> ticket is reserved
    if (ticket.orderId)
        throw new BadRequestError('cannot edit a reserved ticket')

    if (ticket.userId !== req.currentUser!.id)
        throw new NotAuthorizedError()

    ticket.set({
        title: req.body.title,
        price: req.body.price
    })//only updates in memory

    await ticket.save()//saves into db
    new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    })

    res.send(ticket)
})

export { router as updateTicketRouter }