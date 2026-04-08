const express=require('express');

const router = express.Router();
const {register,login,updateProfile,userData}=require('../controllers/authController');



router.post('/register',register);
router.post('/login',login);
router.post('/updateProfile',updateProfile);


module.exports=router;