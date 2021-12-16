const UserEntity = require('../entities/UserEntity')
const RoleEntity = require('../entities/RoleEntity')

class UserRepository {
    async getUsers(req, res) {
        try {
            const { username } = req.body; // username = name
            const getByName = await UserEntity.findOne({username})
            console.log('getUser')
            if(!getByName) { res
                .status(400)
                .json({message: `User with name ${username} not found ~~ getUsers(username).`})
            }
            console.log('getByName', getByName)
            const { role, subordinates } = getByName
            if(role === 'User'){
                console.log('user')
                res.json(username)
            }
            if(role === 'Boss'){
                console.log('boss')
                res.json({subordinates, username})
            }
            if(role === 'Admin'){
                console.log('admin')
                const users = await UserEntity.find()
                res.json(users)
            }
            console.log('return')
            return
        } catch (e) {
            console.log(e)
        }

    }
    async getAll(res) {
        try {
            const users = await UserEntity.find()
            res.json(users)
        } catch (e) {
            console.log(e)
        }
    }

    async setRole(req, res) { // TODO: delete this, command for admin
        try {
            const {username, newRole} = req.body;
            const userRole = await RoleEntity.findOne({value: newRole})
            if(!userRole) { res
                .status(400)
                .json({message: `Role ${newRole} not found.`})
            }
            await UserEntity.updateOne({username: username},
                { $set: { role : newRole }})
            return res.json({message: "Role was changed."})
        } catch (e) {
            console.log(e)
        }
    }
    async setSubordinate(req, res) {
        try {
            const {username, subordinates} = req.body;
            const user = await UserEntity.findOne({username: subordinates})
            if(!user) { res
                .status(400)
                .json({message: `User with username: ${subordinates} not found.`})
            }
            const { boss } = user
            if(boss === null){
                const getRolByName = await UserEntity.findOne({username: username})
                if(!getRolByName) { res
                    .status(400)
                    .json({message: `New boss with username: ${username} not found.`})
                }
                const { role } = getRolByName;
                if(role === 'Boss'){
                    await UserEntity.updateOne({username: username},
                        { $push: { subordinates: [ subordinates ] }})

                    await UserEntity.updateOne({username: subordinates},
                        { $set: { boss: username }})

                    return res.json({message: "Bos was set."})
                }
                return res.json({message: `Requires a boss role, your role is: ${role}`})
            }
            return res.json({message: `This user ${username} already has a boss ${boss}`})
        } catch (e) {
            console.log(e)
        }
    }
    async checkSubordinate(username, newSubordinate){
        const user = await UserEntity.findOne({username})
        if(!user) { res
            .status(400)
            .json({message: `User with username: ${username} not found.`})
        }
        const { subordinates } = user
       return subordinates.includes(newSubordinate)
    }

    async unsetSubordinates(username, formerSubordinates){
        const user = await UserEntity.findOne({username: username})
        if(!user) { res
            .status(400)
            .json({message: `User with username: ${username} not found.`})
        }
        const { subordinates } = user
        const index = subordinates.indexOf(formerSubordinates);
        if (index > -1) {
            subordinates.splice(index, 1);
        }
        await UserEntity.updateOne({username: username},
            { $set: { subordinates: subordinates }})
        return true;
    }

    async transferSubordinate(req, res) {
        try {
            const {username, subordinates, newBoss} = req.body;
            const user = await UserEntity.findOne({username: subordinates})
            if(!user) { res
                .status(400)
                .json({message: `User with username: ${subordinates} not found.`})
            }
            const { boss } = user
            if(boss === username){
                const getNewBossStrict = await UserEntity.findOne({username: newBoss})
                if(!getNewBossStrict) { res
                    .status(400)
                    .json({message: `New boss with username: ${newBoss} not found.`})
                }
                const { boss } = getNewBossStrict;
                if(boss === null){
                    await UserEntity.updateOne({username: newBoss},
                        { $push: { subordinates: [ subordinates ] }})
                    await this.unsetSubordinates(username, subordinates)
                    return res.json({message: "Bos was changed."})
                }
                return res.json({message: "This user already has a boss."})
            }
            return res.json({message: `This user ${username} is not the boss for ${subordinates}`})
        } catch (e) {
            console.log(e)
        }
    }
}



module.exports = new UserRepository()