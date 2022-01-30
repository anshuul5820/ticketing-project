import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async () => {
    //create an instance of a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: '3242'
    })

    //save ticket to db
    await ticket.save()

    //fetch ticket twice
    const firstInstance = await Ticket.findById(ticket.id)
    const secondInstance = await Ticket.findById(ticket.id)

    //make 2 separate changes to the tickets we fetched
    firstInstance!.set({ price: 10 })//firstInstance might be null
    secondInstance!.set({ price: 15 })

    //save first fetched ticket(vs-1)
    await firstInstance!.save()

    //save second fetched ticket(by this time, v would be outdated, incremented on db, same on local)
    try {
        await secondInstance!.save();
    } catch (err) {
        return;
    }

    throw new Error('shouldnt reach this point')
    //if err thrown, exit of fn, pass test case
})


it('increments ver no on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 30,
        userId: '123'
    })
    await ticket.save()
    expect(ticket.version).toEqual(0)

    await ticket.save()
    expect(ticket.version).toEqual(1)

    await ticket.save()
    expect(ticket.version).toEqual(2)
})