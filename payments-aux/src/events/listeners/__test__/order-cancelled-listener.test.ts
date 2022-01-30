import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from "@ticketing-common-lib05/common"
import mongoose from "mongoose"
import { natsWrapper } from "../../../nats-wrapper"
import { Message } from 'node-nats-streaming'
import { Order } from "../../../models/order"
import { OrderCancelledListener } from "../order-cancelled-listener"

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client)

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 10,
        userId: 'sdfdsf',
        version: 0
    })

    await order.save()

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'sdfdsf',
        }
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg, order }
}

it('updates status of order', async () => {
    const { listener, data, msg, order } = await setup()

    await listener.onMessage(data, msg)

    //refetch data from db, check orderStatus=cancelld
    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message', async () => {
    const { listener, data, msg, order } = await setup()

    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})
