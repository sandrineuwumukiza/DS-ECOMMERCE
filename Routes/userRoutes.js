import express from 'express';
import { RegisterUser, UserLogin, resetPassword, getProfile } from '../controllers/userController.js';
import { addProduct, getProductsByCategory, updateProductById, deleteProductById, getAllProducts } from '../controllers/productController.js';
// import { addProductValidator } from '../utils/validation.js';
import upload from '../utils/uploadImage.js';
import { Auth } from "../middleware/auth.js"
// import { Auth } from '../middleware/auth.js';
const userRouter = express.Router();


userRouter.post('/registerUser', RegisterUser);
userRouter.post('/login', UserLogin);
userRouter.post('/products/addProduct',Auth, upload.single('image'), addProduct);
userRouter.get('/products/productList', getAllProducts);
userRouter.put('/updateProduct/:id', updateProductById);
// productRouter.get('/productById/:id', getProductById)
userRouter.delete('/products/delete/:id', deleteProductById);
userRouter.get('/products/category/:category', getProductsByCategory);
// userRouter.get('/profile', Auth, getProfile)
// userRouter.get('/forgotPassword', forgotPassword)


export default userRouter;

