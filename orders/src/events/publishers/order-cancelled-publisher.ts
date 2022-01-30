import { Publisher, OrderCancelledEvent, Subjects } from "@ticketing-common-lib05/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}

