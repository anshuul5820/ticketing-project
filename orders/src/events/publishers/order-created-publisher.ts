import { Publisher, OrderCreatedEvent, Subjects } from "@ticketing-common-lib05/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated
}

