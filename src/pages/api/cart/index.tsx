import { NextApiRequest, NextApiResponse } from 'next';
import { connectMongoDb } from '../../../../middleware/mongoose';
import userModel from '../../../../models/user';
import productModel from 'models/product';
import cartModel from 'models/cart';
var CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');

export default async function handler(req: any, res: NextApiResponse) {
  try {
    await connectMongoDb();
    if (req.method == 'GET') {
      try {
        let { id } = jwt.verify(
          req.headers?.authorization,
          process.env.JWT_SECRET
        );

        if (id) {
          let cart = await cartModel.findOne({ userId: id });
          if (cart) {
            return res.status(200).json({ message: 'cart found', data: cart });
          } else {
            return res.status(400).json({ message: 'cart is empty', data: [] });
          }
        }
      } catch (err) {
        console.log('err', err);
        return res.status(400).json({ message: 'Something Went wrong' });
      }
    } else if (req.method == 'POST') {
      try {
        let { id } = jwt.verify(
          req.headers?.authorization,
          process.env.JWT_SECRET
        );
        if (id) {
          let userCart = await cartModel.findOne({ userId: req.body.userId });

          if (userCart) {
            let productInUserCart = await cartModel.findOne({
              productId: req.body.productId,
            });
            if (productInUserCart) {
              let getProductInCart = await cartModel.findOne({
                productId: req.body.productId,
                userId: req.body.userId,
              });
              if (getProductInCart) {
                let updateCart = await cartModel.findOneAndUpdate(
                  {
                    productId: req.body.productId,
                    userId: req.body.userId,
                    size: req.body.size,
                    color: req.body.color,
                  },
                  {
                    quantity: req.body.quantity,
                    totalPrice: req.body.quantity,
                  }
                );
                if (updateCart) {
                  return res
                    .status(200)
                    .json({ message: 'cart add sucessfull', data: updateCart });
                } else {
                  return res
                    .status(400)
                    .json({ message: 'addToCart not saved' });
                }
              } else {
                return res
                  .status(400)
                  .json({ message: 'product already exist, but not updated' });
              }
            } else {
              let addToCart = await cartModel(req.body).save();
              if (addToCart) {
                return res
                  .status(200)
                  .json({ message: 'cart add sucessfull', data: addToCart });
              } else {
                return res.status(400).json({ message: 'addToCart not saved' });
              }
            }
          } else {
            let addToCart = await cartModel(req.body).save();
            if (addToCart) {
              return res
                .status(200)
                .json({ message: 'cart add sucessfull', data: addToCart });
            } else {
              return res.status(400).json({ message: 'addToCart not saved' });
            }
          }
        } else {
          return res.status(400).json({ message: 'Invalid token' });
        }
      } catch (err) {
        console.log('err', err);
        return res.status(400).json({ message: 'Something Went wrong' });
      }
    } else if (req.method == 'PUT') {
      try {
        let { id } = jwt.verify(
          req.headers?.authorization,
          process.env.JWT_SECRET
        );
        let deleteProduct = await cartModel.findOneAndDelete({
          _id: req.params?.id,
          userId: id,
        });
        if (deleteProduct) {
          return res.status(200).json({
            message: 'product delete from cart successfull',
            data: deleteProduct,
          });
        } else {
          return res
            .status(400)
            .json({ message: 'Product not found in database' });
        }
      } catch (err) {
        return res.status(400).json({ message: 'Something Went wrong' });
      }
    } else if (req.method == 'DELETE') {
      try {
        let { id } = jwt.verify(
          req.headers?.authorization,
          process.env.JWT_SECRET
        );
        console.log('req.params?.id ', req.params?.id);
        if (id) {
          let cart = await cartModel.deleteMany({ userId: id });
          if (cart) {
            return res
              .status(200)
              .json({ message: 'cart delete successfull', data: cart });
          } else {
            return res.status(400).json({ message: 'cart not found' });
          }
        } else {
          return res.status(400).json({ message: 'Invalid Token' });
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
