import  mongoose  from "mongoose";
import  validator  from "validator";

interface Iuser extends Document {
    _id:string;
    name:string;
    email:string;
    photo:string;
    gender: "male" | "female";
    role:"user" | "admin";
    dob:Date;
    createdAt:Date;
    updatedAt:Date;
    // virtual attribute
    age:number;
}

const userSchema = new mongoose.Schema({
        _id:{
            type:String,
            required:[true,"Please enter ID"]
        },
        name:{
            type:String,
            required:[true,"Please enter name"]
        },
        email:{
            type:String,
            unique:[true, "Email already existed"],
            required:[true,"Please enter email"],
            validate:validator.default.isEmail,
        },
        gender:{
            type:String,
            enum:["male","female"],
            required:[true, "please enter gender"]
        },
        dob:{
            type:Date,
            required:[true,"Please enter DOB"]
        },
        photo:{
            type:String,
            required:[true,"Please add photo"],
        },
        role:{
            type:String,
            enum:["admin","user"],
            default:"user",
        },
    },{
        timestamps:true,
})

userSchema.virtual("age").get(function(){
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();
    if(today.getMonth() < dob.getMonth() || today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) {
        age-- ;
    } else {
        return age;
    }
});

export const userModel = mongoose.model<Iuser>('User', userSchema)