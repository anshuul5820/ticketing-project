import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"
import { OrderCreatedEvent, OrderStatus } from "@ticketing-common-lib05/common"
import mongoose from "mongoose"
import { Message } from 'node-nats-streaming'

const setup = async () => {
    //create instance of listbner
    const listener = new OrderCreatedListener(natsWrapper.client)

    //create & save ticket
    const ticket = Ticket.build({
        title: 'fsfs',
        price: 324,
        userId: 'asdf'
    })
    await ticket.save()

    //create fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: 'dsfsf',
        version: 0,
        expiresAt: 'dsfsdfs',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, data, msg }
}

it('set the userId of the tickt', async () => {
    const { listener, ticket, data, msg } = await setup()
    await listener.onMessage(data, msg)

    //above data is outdated, so refetching
    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.orderId).toEqual(data.id)
})

it('calls the ack message', async () => {
    const { listener, ticket, data, msg } = await setup()
    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
    const { listener, ticket, data, msg } = await setup()
    await listener.onMessage(data, msg)

    expect(natsWrapper.client.publish).toHaveBeenCalled()

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

    expect(data.id).toEqual(ticketUpdatedData.orderId)
})