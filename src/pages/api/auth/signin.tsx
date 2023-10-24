import { connectMongoDb } from 'middleware/mongoose';
import userModel from 'models/user';
import { NextApiRequest, NextApiResponse } from 'next';

var CryptoJS = require('crypto-js');
var jwt = require('jsonwebtoken');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectMongoDb();
    if (req.method == 'POST') {
      try {
        let userData = await userModel.findOne(
          { email: req.body.email },
          { name: 1, email: 1, password: 1 }
        );
        if (userData) {
          var bytes = CryptoJS.AES.decrypt(
            userData.password,
            process.env.AES_SECRET
          );
          var originalText = bytes.toString(CryptoJS.enc.Utf8);
          if (
            req.body.email == userData.email &&
            req.body.password == originalText
          ) {
            var token = jwt.sign(
              { name: userData.name, email: userData.email, id: userData?._id },
              process.env.JWT_SECRET
            );
            let response = {
              name: userData.name,
              email: userData.email,
              token: token,
              id: userData.id,
            };
            return res
              .status(200)
              .json({ message: 'Sign in Successfully', data: response });
          } else {
            return res.status(400).json({ message: 'invalid credential' });
          }
        } else {
          return res.status(400).json({ message: 'user not found' });
        }
      } catch (err) {
        console.error(err);
        return res.status(400).json({ message: 'Something went wrong' });
      }
    } else {
      return res.status(400).json({ message: 'This method is not allowed' });
    }
  } catch (e) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}
