//models/tickets.ts

//model for ticket
import mongoose from 'mongoose'
import { Order, OrderStatus } from './order'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'


interface TicketAttrs {
  title: string
  price: number
  id: string
}

export interface TicketDoc extends mongoose.Document {
  title: string
  price: number
  version: number
  isReserved(): Promise<boolean>
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}
//findByEvent- find doc with ver(currVer-1)
//Promise<TicketDoc | null>- if found, resolve with type Ticketdoc || null

//TicketAttrs vs ticketdoc- attrs: schema of incoming data
//doc: schema of db saved into mongo(processed)

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id
      delete ret._id
    }
  }
})

ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  // return new Ticket(attrs)
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price
  })
}

ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete
      ]
    }//checks for these things
  })

  return !!existingOrder
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)
//('Ticket', ticketSchema)- name of db, schema name

export { Ticket }

//dont put this is common lib
//- this class has a diff purpose
//- original ticket serv might contain more fields than this class
//- this class is only for saving db