import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/Apierror.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import { upload } from "../middlewares/multer.middleware..js";
import { ApiResponse } from "../utils/Apiresponse.js";


const registerUser=asyncHandler(async(req,res)=>{
    //get user details from frontend
    //validation-not empty
    //check if user already exist:username,email
    //check for images ,check for avatar
    //upload them on cloudinary,avatar
    //create user object-create entry in db
    //remove password and refresh token field from response
    //check for user creation 
    //return res

    const{fullName,email,userName,password}=req.body
    console.log("email:",email);

    if(fullName ===""){
        throw new apiError(400,"fullname is required")
    }
    if(
        [fullName,email,userName,password].some((field)=>{
            field?.trim()===""
        })
    ){
        throw new apiError(400,"All field are required")
    }

    const existedUser=User.findOne({
        $or:[{userName},{email}]
    })

    if(existedUser){
        throw new apiError(409,"User with email or username already exist")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path
    const coverImageLocalPath=req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new apiError(400,"Avatar file is required")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!avatarLocalPath){
        throw new apiError(400,"Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        userName:userName.toLowerCase()
    })

    const createdUser=await User.find(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500,"Something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )



})

export {registerUser}