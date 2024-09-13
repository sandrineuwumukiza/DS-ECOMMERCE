import express from 'express';
import { RegisterUser, UserLogin, resetPassword, verifyEmail, forgotPassword, deleteUserById} from '../controllers/userController.js';
const userRouter = express.Router();


userRouter.post('/registerUser', RegisterUser);
userRouter.post('/login', UserLogin);
// userRouter.get('/profile', Auth, getProfile)
userRouter.post('/forgotpassword', forgotPassword)
userRouter.put('/resetpassword/:token', resetPassword)
userRouter.get('/verifyemail/:token', verifyEmail)
userRouter.delete('/delete/:id', deleteUserById)


export default userRouter;

