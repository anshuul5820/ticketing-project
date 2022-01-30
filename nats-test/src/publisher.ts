import { randomBytes } from 'crypto'
import nats from 'node-nats-streaming'
import { TicketCreatedPublisher } from './events/ticket-created-publisher'

console.clear()

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), { url: 'http://localhost:4222' })//emits connect event

stan.on('connect', async () => {
    console.log('publisher connected to NATS')

    const publisher = new TicketCreatedPublisher(stan)
    await publisher.publish({
        id: '124',
        title: 'concert',
        price: 20
    })

    const data = JSON.stringify({
        id: '123',
        title: 'Concert',
        price: 20
    })

    stan.publish('ticket:created', data, () => {
        console.log('event published')
    })//()=>{} runs after published 
})//listen to connect event 