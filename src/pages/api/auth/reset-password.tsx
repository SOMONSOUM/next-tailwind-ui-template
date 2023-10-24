import { NextApiRequest, NextApiResponse } from 'next';
import { connectMongoDb } from '../../../../middleware/mongoose';
import userModel from '../../../../models/user';
var CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectMongoDb();
    if (req.method == 'POST') {
      try {
        var ciphertext = CryptoJS.AES.encrypt(
          req.body.password,
          process.env.AES_SECRET
        ).toString();
        let isAlready = await userModel
          .findOneAndUpdate(
            { _id: req.body?.id },
            { password: ciphertext },
            { new: true }
          )
          .select('email name ');
        if (isAlready) {
          return res
            .status(200)
            .json({ message: 'Successfull change', data: isAlready });
        } else {
          return res.status(400).json({ message: 'User not found' });
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
