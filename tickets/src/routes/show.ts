import { NotFoundError } from '@ticketing-common-lib05/common';
import express, { Request, Response } from 'express'
import { Ticket } from "../models/ticket";

const router = express.Router()

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id)//return ticket obj

    if (!ticket) {
        throw new NotFoundError()
    }

    res.send(ticket)
})

export { router as showTicketRouter }