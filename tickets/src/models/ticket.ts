import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface TicketAttrs {
    title: string
    price: number
    userId: string
}
interface TicketDoc extends mongoose.Document {
    title: string
    price: number
    userId: string
    orderId?: string
    version: number//__v-> version, no type defn exists for version
}
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc
}

const ticketSchema = new mongoose.Schema({
    title: { type: String, required: true },//String-> js class
    price: { type: Number, required: true },
    userId: { type: String, required: true },//String-> js class
    orderId: { type: String }
},
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id
                delete ret._id
            }
        }//ret- object thatll be returned
    })

ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs)
}//this fn is created so ts can help to know attributes

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }