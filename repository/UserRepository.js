const UserEntity = require('../entities/UserEntity');
const RoleEntity = require('../entities/RoleEntity');
const jwt = require("jsonwebtoken");
const {secret} = require("../config/config");

class UserRepository {
    async getUsers(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const {role, id} = jwt.verify(token, secret);
            if(role === 'User'){
                const user = await UserEntity.findOne({_id: id});
                return res.json(user);
            }
            if(role === 'Boss'){
                const user = await UserEntity.findOne({_id: id})
                const {username} = user;
                const getByName = await UserEntity.find({$or: [{username: username}, {boss: username}]});
                return res.json(getByName);
            }
            if(role === 'Admin'){
                const users = await UserEntity.find()
                return res.json(users)
            }
            return res.json({message: "Misaligned user role."});
        } catch (e) {
            return console.log(e);
        }

    }
    async setRole(req, res) { // TODO: delete this, command for admin
        try {
            const token = req.headers.authorization.split(' ')[1];
            const {role} = jwt.verify(token, secret);
            if(role !== 'Admin') return res.json({message: "You don't have permission to use this."});
            const {username, newRole} = req.body;
            const userRole = await RoleEntity.findOne({value: newRole});
            if(!userRole) { res
                .status(400)
                .json({message: `Role ${newRole} not found.`})
            }
            await UserEntity.updateOne({username: username},
                { $set: { role : newRole, boss: null }});
            return res.json({message: "Role was changed."});
        } catch (e) {
            return console.log(e);
        }
    }
    async setBoss(req, res) {
        try {
            const { subordinate, newBoss } = req.body;
            const token = req.headers.authorization.split(' ')[1];
            const {id, role} = jwt.verify(token, secret);
            if(role !== 'Boss') return res.json({message: "You don't have permission to use this."});

            const checkRole = await UserEntity.findOne({username: newBoss, role: 'Boss'})
            if(!checkRole) return res.json({message: "This user has an inappropriate role."})

                const getBoss = await UserEntity.findOne({_id: id})
                const { username } = getBoss;
                const getSubordinate = await UserEntity.findOne({username: subordinate, boss: username});
                if(getSubordinate){
                    await UserEntity.updateOne({username: subordinate},
                        { $set: { boss : newBoss }})
                    return res.json({message: "Boss was changed."});
                }
                return res.json({message: `A subordinate with name ${subordinate} was not found.`});
        } catch (e) {
            return console.log(e);
        }
    }
    async addNewRole(req, res){
        try {
            const { newRole } = req.body;
            const token = req.headers.authorization.split(' ')[1];
            const {role} = jwt.verify(token, secret);
            if(role !== 'Admin') return res.json({message: "You don't have permission to use this."});

            const addRole = new RoleEntity({value: newRole});
            await addRole.save();
            return res.json({message: `Role added successfully.`});
        } catch (e) {
            return console.log(e);
        }
    }
}



module.exports = new UserRepository()