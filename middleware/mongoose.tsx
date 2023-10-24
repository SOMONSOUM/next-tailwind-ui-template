import mongoose from 'mongoose';

export const connectMongoDb = async () => {
  console.log('first');
  if (mongoose.connection.readyState == 1) {
    console.log('Connect ==1');
    return mongoose.connection.asPromise();
  }
  console.log('first');

  await mongoose.connect(process.env.MONGO_URI as string);
};
