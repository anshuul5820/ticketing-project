import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"
import mongoose from 'mongoose'
import { OrderCancelledEvent } from "@ticketing-common-lib05/common"
import { Message } from 'node-nats-streaming'

const setup = async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString()
    const listener = new OrderCancelledListener(natsWrapper.client)
    const ticket = Ticket.build({
        title: 'concert',
        price: 23,
        userId: 'fsdf'
    })//we dont want to create ticket with predefined ordrId, so not changing interface

    ticket.set({ orderId })
    await ticket.save()

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { msg, data, ticket, orderId, listener }
}

it('updates ticket, publishes event, acks message', async () => {
    const { msg, data, ticket, orderId, listener } = await setup()

    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})