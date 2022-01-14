const jwt = require('jsonwebtoken');

const secret = 'vendorSecret'

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');

    if(!token) {
        return res.status(401).json({ msg: 'No token, authorization denied '});
    }

    try {
        const decodedToken = jwt.verify(token, secret);

        req.user = decodedToken.user;

    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
    next();
}