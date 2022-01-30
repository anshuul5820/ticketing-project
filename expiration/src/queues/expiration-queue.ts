import Queue from "bull";
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publisher";
import { natsWrapper } from "../nats-wrapper";

//struct of data to be stored inside redis
interface Payload {
    orderId: string
}

//part of redis server where a job is stored(Job- JS obj)
const expirationQueue = new Queue<Payload>('order-expiration', {
    redis: {
        host: process.env.REDIS_HOST
    }
})

expirationQueue.process(async (job) => {
    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId
    })
    //publish expiration:complete event    
})

export { expirationQueue }