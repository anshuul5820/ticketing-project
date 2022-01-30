export const natsWrapper = {
    client: {
        // publish: (subject: string, data: string, callback: () => void) => {
        //     callback()
        // } cant expect here
        publish: jest.fn().mockImplementation((subject: string, data: string, callback: () => void) => {
            callback()
        })//can expect here
    }
}
//issue, single instance of natsWrapper is used for all instances