const mongoose=require("mongoose")
const userSchema=mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    passwordHash:{type:String,required:true},
    role:{type:String,default:"USER",enum:["ADMIN","USER"]},
    avatar:{type:String,default:""},
    stats:{
        rating:{type:Number,default:1000},
        wins:{type:Number,default:0},
        losses:{type:Number,default:0},
        draws:{type:Number,default:0},
        gamesPlayed:{type:Number,default:0},
        currentStreak:{type:Number,default:0},
        bestStreak:{type:Number,default:0}
    }


},{timestams:true})
const User=mongoose.model("User",userSchema)
module.exports={User}