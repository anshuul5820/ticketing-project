import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'
//fake nats-wrapper is imported

it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({})

    expect(response.status).not.toEqual(404)
})

it('can only be accessed if user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({})
        .expect(401)//alt syntax for expect

    //expect(response.status).toEqual(401)
})

it('returns a status!=401 if user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({})

    expect(response.status).not.toEqual(401)
})

it('returns error for invalid title', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({ title: '', price: 10 })
        .expect(400)

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({ price: 10 })
        .expect(400)
})

it('returns error for invalid price', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({ title: 'sdffs', price: -10 })//price>0
        .expect(400)

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({ title: 'rgw' })
        .expect(400)
})

it('creates a ticket for valid inputs', async () => {
    //add in a check to check for ticket price
    //logic used here: check l(tickets) ticket Collection, after processing, check l(tickets), 1 more
    let tickets = await Ticket.find({})
    expect(tickets.length).toEqual(0)
    //ticket colleciton is flushed after each test

    await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({ title: 'asdfs', price: 20 })
        .expect(201)

    tickets = await Ticket.find({})
    expect(tickets.length).toEqual(1)
})

it('publishes an event', async () => {
    const title = 'dfw'
    await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({ title, price: 20 })
        .expect(201)
    console.log('', natsWrapper)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
    //returns T if publish() gets invoked after creating ticket
})