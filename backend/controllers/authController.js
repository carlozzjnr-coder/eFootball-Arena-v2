const pool = require('../config/database');
const { hashPassword, comparePassword } = require('../config/security');
const { generateToken } = require('../config/jwt');
const { v4: uuidv4 } = require('uuid');

class AuthController {
  async register(req, res) {
    const { email, password, username } = req.body;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if user exists
      const userCheck = await client.query(
        'SELECT * FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );
      if (userCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email or username already registered' });
      }

      // Create user
      const userId = uuidv4();
      const passwordHash = await hashPassword(password);
      await client.query(
        'INSERT INTO users (id, email, username, password_hash) VALUES ($1, $2, $3, $4)',
        [userId, email, username, passwordHash]
      );

      await client.query('COMMIT');

      const token = generateToken({ userId, email, is_admin: false });
      res.status(201).json({
        message: 'Registration successful',
        userId,
        token
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async login(req, res) {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      is_admin: user.is_admin
    });

    res.json({
      message: 'Login successful',
      token,
      userId: user.id
    });
  }

  async logout(req, res) {
    res.json({ message: 'Logout successful' });
  }

  async refreshToken(req, res) {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const decoded = require('../config/jwt').decodeToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const newToken = generateToken({
      userId: decoded.userId,
      email: decoded.email,
      is_admin: decoded.is_admin
    });

    res.json({ token: newToken });
  }

  async verifyToken(req, res) {
    res.json({
      message: 'Token is valid',
      user: req.user
    });
  }
}

module.exports = new AuthController();
