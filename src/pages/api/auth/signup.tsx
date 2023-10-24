import { NextApiRequest, NextApiResponse } from 'next';
import { connectMongoDb } from '../../../../middleware/mongoose';
import userModel from '../../../../models/user';
var CryptoJS = require('crypto-js');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectMongoDb();
    if (req.method == 'POST') {
      try {
        let user = await userModel.findOne({ email: req.body.email });
        if (user) {
          return res.status(400).json({ message: 'user already found' });
        } else {
          var ciphertext = CryptoJS.AES.encrypt(
            req.body.password,
            process.env.AES_SECRET
          ).toString();

          var data = await new userModel({
            name: req.body.name,
            email: req.body.email,
            password: ciphertext,
          }).save();
          // let data = await userData.save();
          console.log('data', data);
          if (data)
            return res
              .status(200)
              .json({ message: 'Sign Up Successfully', data: data });
        }
      } catch (err) {
        console.log('err', err);
        return res.status(400).json({ message: 'Something Went wrong' });
      }
    } else {
      return res.status(400).json({ message: 'This method is not allowed' });
    }
  } catch (e) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}
