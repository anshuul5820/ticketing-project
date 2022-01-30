import { Listener, OrderCancelledEvent, OrderCreatedEvent, OrderStatus, Subjects } from "@ticketing-common-lib05/common";
import { Message } from "node-nats-streaming";
import { isMissingDeclaration } from "typescript";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";
import { TicketCreatedPublisher } from "../publishers/ticket-created-publisher";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        //from ticket collectin, find ticket order is reserving
        const ticket = await Ticket.findById(data.ticket.id)

        //if no ticket, throw err
        if (!ticket) throw new Error('ticket not found')
        //mark ticket as being resrved by setting orderId prop
        ticket.set({ orderId: data.id })

        //save ticket
        await ticket.save()
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version
        })

        //ack the message
        msg.ack()
    }
}