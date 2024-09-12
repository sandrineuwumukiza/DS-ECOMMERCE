import express from 'express';
import productRouter from './productRoutes.js';
import userRouter from './userRoutes.js';
const router = express.Router();
// import cartRouter from './cartRoutes.js';
// import paymentRouter from './payment.js'


router.use('/products', productRouter)
// router.use('/cart', cartRouter)
// router.use('/orders', orderRouter)
router.use('/users', userRouter);
// router.use('/pay', paymentRouter);
// router.use('/farmer',farmerRouter);
// router.use('/token',tokenRouter);



export default router