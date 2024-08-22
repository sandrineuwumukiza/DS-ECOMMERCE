import express from 'express';
import { RegisterUser, UserLogin, resetPassword, getProfile } from '../controllers/userController.js';
// import { Auth } from '../middleware/auth.js';
const userRouter = express.Router();


userRouter.post('/registerUser', RegisterUser);
userRouter.post('/login', UserLogin);
// userRouter.get('/profile', Auth, getProfile)
// userRouter.get('/forgotPassword', forgotPassword)


export default userRouter;

