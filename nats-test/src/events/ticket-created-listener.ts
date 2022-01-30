import { Message } from "node-nats-streaming"
import { Listener } from "./base-listener"
import { Subjects } from "./subjects"
import { TicketCreatedEvent } from "./ticket-created-event"

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated
    queueGroupName = 'payments-service'
    //readonly-prevents a property of a class from being changed

    onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
        console.log('event data!', data)
        msg.ack()
    }
}