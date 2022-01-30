import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken'

declare global {
  var signin: () => string[];
}

jest.mock('../nats-wrapper')


let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = 'asdf '
  mongo = await MongoMemoryServer.create()
  const mongoUri = mongo.getUri()

  await mongoose.connect(mongoUri)
})

beforeEach(async () => {
  jest.clearAllMocks()//clears all prev mock implemetations
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});


//fake authentication in test env
global.signin = () => {
  //build a jwt payload {id, email, iat}
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  }

  //create jwt 
  const token = jwt.sign(payload, process.env.JWT_KEY!)

  //build session obj {jwt: MY_JWT}
  const session = { jwt: token }

  //turn session into json
  const sessionJSON = JSON.stringify(session)

  //take json & encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64')

  //return string with encoded data
  return [`session=${base64}`]//supertest accepts cookies in []
};
