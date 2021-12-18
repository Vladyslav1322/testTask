const UserEntity = require('../entities/UserEntity');
const RoleEntity = require('../entities/RoleEntity');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { secret } = require("../config/config");

const createAccessToken = (id, role, username) => {
    const payload = {
        id,
        role,
        username,
    };
    return jwt.sign(payload, secret, {expiresIn: "4h"} );
}

class AuthRepository {
    async registration(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400)
                    .json({
                        msg: "Registration error validationResult.", errors
                    });
            }
            const {username, password} = req.body;
            const registrationUser = await UserEntity.findOne({username});
            if (registrationUser) {
                return res.status(400).json({message: "User already exist."});
            }
            const hashPassword = bcrypt.hashSync(password, 10);
            const userRole = await RoleEntity.findOne({value: "User"});
            const getBosses = await UserEntity.find({role: 'Boss'});
            let randomBoss = Math.floor(Math.random() * getBosses.length);

            const user = new UserEntity({boss: getBosses[randomBoss].username, username, password: hashPassword, role: userRole.value});
            await user.save();
            return res.json({message: "Registration success."});
        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'Registration error.'});
        }
    }

    async login(req, res) {
        try {
            const {username, password} = req.body;
            const user = await UserEntity.findOne({username});
            if (!user) {
                return res
                    .status(400)
                    .json({message: `User with name ${username} not found.`});
            }

            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return res.status(400)
                    .json({message: `Incorrect password entered`});
            }
            const token = createAccessToken(user._id, user.role, username);
            return res.json({token});
        } catch (e) {
            console.log(e)
            res.status(400)
                .json({message: 'Login error'});
        }
    }
}
module.exports = new AuthRepository();