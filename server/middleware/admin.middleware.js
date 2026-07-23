const jwt = require('jsonwebtoken')
const config = require('config')
const User = require('../models/User')

module.exports = async (req, res, next) => {
    if(req.method === 'OPTIONS'){
        return next()
    }

    try {
        const token = req.headers.authorization.split(' ')[1]
        if (!token){
            return res.status(401).json({message: 'Auth error'})
        }
        const decoded = jwt.verify(token, config.get('secretKey'))
        req.user = decoded
        req.userId = decoded.id

        // Проверяем роль пользователя
        const user = await User.findById(req.userId)
        if (!user || (user.role !== 'admin' && user.role !== 'filial')) {
            return res.status(403).json({message: 'Access denied. Admin or filial role required'})
        }

        next()
    } catch (e){
        return res.status(401).json({message: 'Auth error'})
    }
}