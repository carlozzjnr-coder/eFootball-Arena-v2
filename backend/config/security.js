const bcrypt = require('bcryptjs');
const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

const hashPassword = async (password) => {
  return await bcrypt.hash(password, ROUNDS);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword
};
