const express=require('express');
const cors=require('cors');
const dotenv=require('dotenv');
const connectDB =require('./src/config/db');



dotenv.config();
const PORT=process.env.PORT ||3001
const app=express();



app.use(express.json());
connectDB();


app.get('/',(req,res)=>{
  res.send('fintech server is on');
})
app.use((err,req,res,next)=>{
  console.error(err.stack);
  res.status(500).json({
    message:"there is an error in server"
  })
})
app.listen(PORT,()=>{
  console.log(`Server is running on port ${PORT}`);

})
