import { ExpirationCompleteEvent, Listener, OrderStatus, Subjects } from "@ticketing-common-lib05/common";
import { Message } from 'node-nats-streaming'
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { queueGroupName } from "./queue-group-name";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent>{
    queueGroupName: string = queueGroupName
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId).populate('ticket')

        if (!order)
            throw new Error('order not found')

        order.set({
            status: OrderStatus.Cancelled,
            // ticket: null, if done null, then user wont know which ticket has he reserved
        })
        await order.save()
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        })
        msg.ack()
    }
}
