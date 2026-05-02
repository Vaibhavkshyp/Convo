import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    fullName : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        required : true,
    },
    pic : {
        type : String,
        default : "https://i.pinimg.com/originals/74/a3/b6/74a3b6a8856b004dfff824ae9668fe9b.jpg",
    }
  },
  {
    timeStamps: true,
  },
);

export default mongoose.model("User", userSchema);