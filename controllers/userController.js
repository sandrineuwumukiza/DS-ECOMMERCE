import User from "../models/userModel.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto';
import { sendEmail } from "../utils/sendEmail.js";

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
export const RegisterUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      isVerified: false, // Initially not verified
    });

    // Save the user to the database
    await user.save();

    // Generate a token for email verification
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // Token valid for 24 hours

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpire = emailVerificationExpire;
    await user.save();

    // Generate a JWT for the newly registered user
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Prepare the verification email URL
    const verificationUrl = `http://localhost:3002/api-docs/users/verifyemail/${verificationToken}`;

    const message = `Please verify your email by clicking on the following link: \n\n ${verificationUrl}`;

    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      message,
    });

    res.status(201).json({
      message: 'User registered. Please verify your email.',
      token
    });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const UserLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // If the user is not found
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the plain text password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);

    // If the passwords do not match
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT for the user
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },  // Payload
      JWT_SECRET,  // Secret key
      { expiresIn: '1h' }  // Token expiration time
    );

    // Send the token and success message
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token  // Send the token to the client
    });

  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUserById = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the ID is a valid ObjectId (optional, but good practice)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error); // Add logging for debugging
    res.status(500).json({ message: 'Server error' });
  }
};


export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  // Hash the token from the request
  const emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');

  try {
    // Log tokens for debugging
    console.log('Verification Token from URL:', token);
    console.log('Hashed Token to Compare:', emailVerificationToken);

    // Find user by the hashed token and check if the token is not expired
    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.log('User not found or token expired');
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Verify email
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Forgot Password Function
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a reset token (plain)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the reset token before saving it to the database
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token expiration time (10 minutes)
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    // Update the user with reset token info
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpire;

    // Save the user (disable validation for other fields)
    await user.save({ validateBeforeSave: false });

    // Send reset URL (using the plain token, not the hashed one)
    const resetUrl = `http://localhost:3002/api-docs/users/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you requested a password reset. \n\nPlease reset your password by making a PUT request to: \n\n ${resetUrl}`;

    // Send the reset email
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message,
    });

    res.status(200).json({ success: true, message: 'Email sent for password resett' });
  } catch (err) {
    console.error(err);

    // Handle server errors
    return res.status(500).json({ message: 'Server error. Email could not be sent' });
  }
};


export const resetPassword = async (req, res) => {
  try {
    // Hash the token provided in the URL
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // Find the user with the matching reset token and check if the token is still valid
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }, // Token expiration check
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Update the user's password and clear reset token fields
    await User.findOneAndUpdate(
      { _id: user._id },
      {
        password: hashedPassword, // Update with the new hashed password
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      },
      { new: true } // Return the updated user
    );

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).send('Server error');
  }
};
