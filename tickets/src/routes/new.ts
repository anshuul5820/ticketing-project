//creates a new ticket

import { requireAuth, validateRequest } from '@ticketing-common-lib05/common'
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher'
import express, { Request, Response } from 'express'

//validate some property on incoming req's body
import { body } from 'express-validator'
import { Ticket } from '../models/ticket'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.post('/api/tickets', requireAuth, [
    body('title').not().isEmpty().withMessage('title is required'),//handles title=undefined|| title=''
    body('price').isFloat({ gt: 0 }).withMessage('price has to be > 0')//handles price=undefined|| title=''
], validateRequest, async (req: Request, res: Response) => {
    const { title, price } = req.body
    const ticket = Ticket.build({ title, price, userId: req.currentUser!.id })
    //currentUser exists is checked by requireAuth
    await ticket.save()
    new TicketCreatedPublisher(natsWrapper.client)
        .publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        })//need 2b tickt.price, cant use const { title, price } = req.body

    res.status(201).send(ticket)
})

export { router as createTicketRouter }

