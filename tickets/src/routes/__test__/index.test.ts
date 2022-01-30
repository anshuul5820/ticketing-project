import request from 'supertest'
import { app } from '../../app'

const createTicket = () => request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({ title: 'asdf', price: 34 })


it('can fetch a list of ticekts', async () => {
    await createTicket()
    await createTicket()
    await createTicket()

    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200)

    expect(response.body.length).toEqual(3)
})