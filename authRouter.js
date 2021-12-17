const Router = require('express');
const router = new Router('mongoose');
const {check} = require("express-validator");
const authRepository = require('./repository/AuthRepository');
const userRepository = require('./repository/UserRepository');
const authMiddleware = require('./middleware/authMiddleware');

// AuthRepository
router.post('/registration', [
    check('username', "Empty input field").notEmpty(),
    check('password', "Insufficient password length").isLength({ min:4, max:10})
], authRepository.registration);
router.post('/login', authRepository.login);

// UserRepository
router.get('/getUsers',authMiddleware, userRepository.getUsers);
router.post('/setRole',authMiddleware, userRepository.setRole);
router.post('/setBoss',authMiddleware, userRepository.setBoss);
router.post('/addRole',authMiddleware, userRepository.addNewRole);


module.exports = router;
