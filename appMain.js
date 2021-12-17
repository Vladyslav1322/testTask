const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRouter');
const PORT = process.env.PORT || 5000

const app = express();

app.use(express.json());
app.use('/auth', authRouter);


const startApp = async () => {
    try {
        await mongoose.connect('mongodb+srv://admin:admin@cluster0.vp9qu.mongodb.net/userProfile?retryWrites=true&w=majority');
        app.listen(PORT, () => console.log(`Server has started ${PORT}`));
    } catch (e) {
        console.log(e);
    }
}

startApp();