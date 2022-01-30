import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import mongoose from 'mongoose'
import { Order } from "../../../models/order";
import { ExpirationCompleteEvent, OrderStatus } from '@ticketing-common-lib05/common';
import { Message } from 'node-nats-streaming'

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client)

    //creating a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 34,
        id: new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save()

    //cancelling a ticket
    const order = Order.build({
        status: OrderStatus.Cancelled,
        userId: 'dsfsf',
        expiresAt: new Date(),
        ticket
    })
    await ticket.save()

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, order, ticket, data, msg }
}

it('updates ordersTatus to cancelldd', async () => {
    const { listener, order, ticket, data, msg } = await setup()
    await listener.onMessage(data, msg)

    //previous order is outdated, ver no changed
    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emit orderCancelled event', async () => {
    const { listener, order, ticket, data, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(natsWrapper.client.publish).toHaveBeenCalled()

    //retrieve no of times publish() has been called
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

    //orderId matches
    expect(eventData.id).toEqual(order.id)
})

it('ack the message', async () => {
    const { listener, order, ticket, data, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})