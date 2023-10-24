import { NextApiRequest, NextApiResponse } from 'next';
import { connectMongoDb } from '../../../../middleware/mongoose';
import userModel from '../../../../models/user';
import productModel from 'models/product';
var CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');

export default async function handler(req: any, res: NextApiResponse) {
  try {
    await connectMongoDb();
    if (req.method == 'GET') {
      try {
        if (req.query?.id) {
          let product = await productModel.findOne({ _id: req.query?.id });
          if (product) {
            return res
              .status(200)
              .json({ message: 'product found', data: product });
          } else {
            return res.status(400).json({ message: 'product not found' });
          }
        } else {
          let { limit, page } = req.query;
          if (limit && page) {
            let product = await productModel
              .find({})
              .skip((page - 1) * limit)
              .limit(limit);
            if (product) {
              return res
                .status(200)
                .json({ message: 'all product found', data: product });
            } else {
              return res.status(400).json({ message: 'product not getting' });
            }
          } else {
            return res
              .status(400)
              .json({ message: 'add limit and page for pagination' });
          }
        }
      } catch (err) {
        console.log('err', err);
        return res.status(400).json({ message: 'Something Went wrong' });
      }
    } else if (req.method == 'POST') {
      try {
        let product = await productModel.findOne({ slug: req.body.slug });
        if (product) {
          return res.status(400).json({ message: 'product already exist' });
        } else {
          var data = await new productModel(req.body).save();

          if (data) {
            return res
              .status(200)
              .json({ message: 'product add sucessfull', data: data });
          } else {
            return res.status(400).json({ message: 'product not saved' });
          }
        }
      } catch (err) {
        console.log('err', err);
        return res.status(400).json({ message: 'Something Went wrong' });
      }
    } else if (req.method == 'PUT') {
      try {
        let product = await productModel.findOneAndUpdate(
          { _id: req.body.id },
          req.body,
          {
            new: true,
          }
        );
        if (product) {
          return res
            .status(200)
            .json({ message: 'product update successfull', data: product });
        } else {
          return res.status(400).json({ message: 'product not updated' });
        }
      } catch (err) {
        return res.status(400).json({ message: 'Something Went wrong' });
      }
    } else if (req.method == 'DELETE') {
      try {
        console.log('req.params?.id ', req.params?.id);
        let product = await productModel.findOneAndDelete({
          _id: req.query?.id,
        });
        if (product) {
          return res
            .status(200)
            .json({ message: 'product delete successfull', data: product });
        } else {
          return res.status(400).json({ message: 'product not found' });
        }
      } catch (err) {
        return res.status(400).json({ message: 'Something Went wrong' });
      }
    } else {
      return res.status(400).json({ message: 'This method is not allowed' });
    }
  } catch (e) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}
