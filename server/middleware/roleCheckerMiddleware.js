const checkRole = (role) => {
    return (req, res, next) => {
      if (!req.user || !req.user.email) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }
  
      if (role === 'admim' || req.user.email.endsWith('@admin.com')) {
        return next();
      }
  
      if (role === 'client' && req.user.email.endsWith('@client.com')) {
        return next(); 
      }
  
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    };
  };
  
  module.exports = checkRole;