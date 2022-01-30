import request from "supertest";
import { app } from "../../app";
import mongoose from 'mongoose'
import { Order } from "../../models/order";
import { OrderStatus } from "@ticketing-common-lib05/common";

it('returns 404 when purchasing order that doesnt exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', signin())
        .send({
            token: 'sdfsfsdf',
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404)
})

it('returns 401 when purchasing order that doesnt belong to a user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 34,
        status: OrderStatus.Created,
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    await order.save()

    await request(app)
        .post('/api/payments')
        .set('Cookie', signin())
        .send({
            token: 'sdfsfsdf',
            orderId: order.id
        })
        .expect(401)

})

it('returns 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString()
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 34,
        status: OrderStatus.Cancelled,
        version: 0,
        userId
    })
    await order.save()

    await request(app)
        .post('/api/payments')
        .set('Cookie', signin(userId))
        .send({
            orderId: order.id,
            token: 'dfsdf'
        })
        .expect(400)
})