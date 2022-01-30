import { Subjects, Publisher, PaymentCreatedEvent } from '@ticketing-common-lib05/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
