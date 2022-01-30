import { Publisher, Subjects, TicketCreatedEvent } from "@ticketing-common-lib05/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    subject: Subjects.TicketCreated = Subjects.TicketCreated
}

