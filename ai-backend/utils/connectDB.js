const mongoose = require("mongoose");
//PASS: '"mongodb+srv://twentekghana:I0XU4wUzi9rZCBil@masync-mern-ai.24hgrcc.mongodb.net/masync-mern-ai?retryWrites=true&w=majority"'
//PASS: MIWH35JQPcGtv0Yi
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://amitmahajan274:MIWH35JQPcGtv0Yi@ai-seo-saas.ptwls.mongodb.net/AI-SEO-SAAS?retryWrites=true&w=majority&appName=AI-SEO-SAAS"
    );

    console.log(`Mongodb connected ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
