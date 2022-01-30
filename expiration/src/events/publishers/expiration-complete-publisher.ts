import { Publisher, Subjects, ExpirationCompleteEvent } from "@ticketing-common-lib05/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete

}