import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { TicketCreatedPublisher } from '../../events/publishers/ticket-created-publisher'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

it('returns 404 if provided id doesnt exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', signin())
        .send({
            title: 'adsfs',
            price: 20
        })
        .expect(404)
})

it('returns 401 if user  is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'adsfs',
            price: 20
        })
        .expect(401)
})

it('returns 401 if user doesnt own ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({ title: 'asdf', price: 34 })

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', signin())
        .send({
            title: 'fsfsd',
            price: 40
        })
        .expect(401)
})

it('returns 400 if user provides an invalid title or price', async () => {
    const cookie = signin()

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'asdf',
            price: 34
        })

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 20
        })
        .expect(400)

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'ewer',
            price: -10
        })
        .expect(400)
})

it('updates the ticket successfully', async () => {
    const cookie = signin()

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'asdf',
            price: 34
        })

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new title',
            price: 100
        })
        .expect(200)

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()

    expect(ticketResponse.body.title).toEqual('new title')
    expect(ticketResponse.body.price).toEqual(100)
})

it('publishes an event', async () => {
    const cookie = signin()

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'asdf',
            price: 34
        })

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new title',
            price: 100
        })
        .expect(200)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('rejects updates if ticket is reserved', async () => {
    const cookie = signin()

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'asdf',
            price: 34
        })

    //get ticket which has been booked just now
    const ticket = await Ticket.findById(response.body.id)

    //orderId=undefined-> ticket is not reserved
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() })
    await ticket!.save()

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new title',
            price: 100
        })
        .expect(400)
})