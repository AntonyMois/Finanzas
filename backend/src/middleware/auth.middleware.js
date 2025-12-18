const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    const tokenFromCookie = req.cookies && req.cookies.token;

    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return res.status(401).json({ message: 'No autorizado: token ausente' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (err) {
    console.error('Error en authMiddleware:', err.message);
    return res.status(401).json({ message: 'No autorizado: token inválido o expirado' });
  }
}

module.exports = authMiddleware;


