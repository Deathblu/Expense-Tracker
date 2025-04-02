const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {});
        console.log("Database connected");
    } catch (err) {
        console.error("Error cpnnecting to Database", err);
        process.exit(1);
    }
};

module.exports = connectDB