const User=require('../models/User');
const {generateToken}=require('../utils/jwt');


const buildAuthResponse=(user,token)=>({
  token,
  user:{
    id:user._id,
    name:user.name,
    email:user.email,
    photoURL:user.photoURL,
    provider:user.provider,
  },
});

const register=async(req,res)=>{
  try{
    const {name,email,password,photoURL}=req.body;
    //if any of the input data is not given
    if(!name || !email || !password){
      return res.status(400).json({
        message:"input is required.name/email/password"
      })
    }
    //checking if same user trying to registering again
    const existingUser = await User.findOne({email:email.toLowerCase()});
    if(existingUser){
      res.status(409).json({
        message:"sorry you can't register twice,you already exists"
      })
    }
    //createing newuser letting a user registering
    const newUser=await User.create({
      name,
      email:email.toLowerCase(),
      password,
      photoURL : photoURL || "",
      provider: "local",
    })

    //generating a token for that user
    const token=generateToken({id:newUser._id,email:newUser.email});
    //sending success's response
    res.status(201).json({
      message:"Congratulations you are registerd successfuly",
      ...buildAuthResponse(newUser,token),

    });
  } catch(error){
    if(error.name==="ValidationError"){
      // res.status(400).json({message:"database validation failed,please check out"})
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(". ") });

    }
    console.error("Registration error:",error);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
}

const login=async(req,res)=>{
  try{
    const {email,password}=req.body;
    //fist check if both of input is given
    if(!email || !password){
      return res.status(400).json({
        message:"Email and password are required"
      });
    }
    //if given then find them from database
    const user = await User.findOne({email:email.toLowerCase()}).select("+password");
    if(!user){
      return res.status(401).json({
        message:"invalid email or password.you are not registered"
      })
    }

    if (user.provider === "google" && !user.password) {
        return res.status(400).json({
        message: "This account uses Google sign-in. Please continue with Google.",
        });
    }
    //password matching test by instance method
    const isMatched =await user.comparePassword(password);
    if(!isMatched){
      res.status(401).json({
        message: "your password is wrong"
      });
    }
    const token=generateToken({id:user._id,email:user.email});
    res.status(200).json({
      message:"You are logged In!!",
      ...buildAuthResponse(user,token),
    })

  } catch(error){
     console.error("Login error:", error);
     res.status(500).json({ message: "Login failed. Please try again." })

  }
  
}

const updateProfile = async(req,res)=>{
  try{
     const user = await User.findById(req.user._id);
     if (!user) return res.status(404).json({ message: "User not found" });

     user.name = name;
     user.photoURL = photoURL;
     await user.save();
    res.status(200).json({
        message:"Profile Updated successfuly",
        user:{
          id: user._id,
          name: user.name,
          email: user.email,
          photoURL: user.photoURL,
          provider: user.provider,

        },

      });


  } catch(error){
    console.error('Profile update error');
    res.status(500).json({
      message:"Profile update failed!"
    })

  }

}

const userData=async(req,res)=>{
  try {
    // req.user is already attached by the protect middleware
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Could not fetch user data." });
  }
}

module.exports={register,login,updateProfile,userData};