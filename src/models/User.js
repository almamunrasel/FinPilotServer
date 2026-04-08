const mongoose=require('mongoose');
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({

  name:{
    type:String,
    requied:[true,"Your name is required"],
    trim:true,
  },
  email:{
    type:String,
    required:[true,'you must enter your email'],
    unique:true,
    lowercase:true,
    trim:true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    
  },
  password:{
    type:String,
    minlength:[6,"password must be at least 6 characters "],
    select:false

  },
  photoURL:{
    type:String,
    default:""
  },
  provider:{
    type:String,
    enum:["local","google"],
    default:"local",
  }

},
{
  timestamps:true
})

///hashing password before saving

userSchema.pre("save",async function(){
  if(!this.isModified("password") || !this.password) return;
  const salt= await bcrypt.genSalt(10);
  this.password=await bcrypt.hash(this.password,salt);


})

//instance method for password matching

userSchema.methods.comparePassword = async function(enteredPassword){
  return bcrypt.compare(enteredPassword,this.password);

}

//when res.json(user) or json.stringfy(user) will be called

userSchema.set("toJSON",{
  transform:(doc,ret)=>{
    ret.id=ret._id;
    delete ret._id;
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("User",userSchema);