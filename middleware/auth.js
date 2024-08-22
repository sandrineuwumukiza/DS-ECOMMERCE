import jwt from 'jsonwebtoken';

export const Auth = (req, res, next) => {
  const token = req.header('Authorization');

  // Check if token is present
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; 
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
