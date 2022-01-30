import { OrderStatus } from '@ticketing-common-lib05/common';
import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//props provided when building an order
interface OrderAttrs {
    id: string
    version: number
    userId: string
    price: number
    status: OrderStatus
}

//props an order obj has
interface OrderDoc extends mongoose.Document {
    version: number
    userId: string
    price: number
    status: OrderStatus
    //id: not provided bcoz mongoose.Document interface already has id defined
}

//take obj of OrderAttrs, returns OrderDoc
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
}, {
    toJSON: {
        //doc-document, ret- return  
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    }
    //version not provided, managed auto by exteernal lib
})

//use 'version' instead of __v
orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = (attrs: OrderAttrs) => {
    //id provided by user
    return new Order({
        _id: attrs.id,
        version: attrs.version,
        price: attrs.price,
        userId: attrs.userId,
        status: attrs.status
    })
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }