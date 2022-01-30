import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'


it('returns a 404 if the ticket is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()

    await request(app).get(`/api/tickets/${id}`).send().expect(404)
})
//this fails bcoz wrong string is passed as id

it('returns ticket if ticket is found', async () => {
    //2 approaches, #1 build ticket, save ticket then check it exists #2 build, save, check on the fly
    const title = 'abcdefghijklmnopqrstuvwxyz'
    const price = 20

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({ title, price })
        .expect(201)

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200)

    expect(ticketResponse.body.title).toEqual(title)
    expect(ticketResponse.body.price).toEqual(price)
})