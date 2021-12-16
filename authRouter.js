const Router = require('express')
const router = new Router('mongoose')
const authRepository = require('./repository/AuthRepository')
const userRepository = require('./repository/UserRepository')
const {check} = require("express-validator")
const authMiddleware = require('./middleware/authMiddleware')
const roleMiddleware = require('./middleware/roleMiddleware')

// AuthRepository
router.post('/registration', [
    check('username', "Empty input field").notEmpty(),
    check('password', "Insufficient password length").isLength({ min:4, max:10})
], authRepository.registration)
router.post('/login', authRepository.login)

// UserRepository
router.get('/users', userRepository.getAll)
router.get('/getUsers', userRepository.getUsers)
router.post('/setRole', userRepository.setRole)
router.post('/transferSubordinate', userRepository.transferSubordinate)
router.post('/setSubordinate', userRepository.setSubordinate)

module.exports = router