import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/User';

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const user: any = await User.findOne({ email });
  
    if (!user || !(await user.matchPassword(password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return; // stop further execution without returning the response
    }
  
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });
  
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  }