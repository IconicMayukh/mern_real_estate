import React from 'react'
import { FcGoogle } from "react-icons/fc";
import {GoogleAuthProvider, getAuth, signInWithPopup} from 'firebase/auth'
import { app } from '../firebase';
import {useDispatch} from 'react-redux'
import {signInSuccess} from '../redux/user/userSlice'
import {useNavigate} from 'react-router-dom'

export default function OAuth() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleGoogleClick = async ()=>{
        try {
            const provider = new GoogleAuthProvider()
            const auth = getAuth(app)

            const result = await signInWithPopup(auth,provider)
            console.log("result................",result)
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({name: result.user.displayName, email: result.user.email, photo: result.user.photoURL})
            })
            const data = await res.json();
            console.log("data............",data)
            dispatch(signInSuccess(data));
            navigate('/')

        } catch (error) {
            console.log("Could not sign in with Google", error);
        }
    }

  return (
    <button type='button' onClick={handleGoogleClick} className='bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-90 cursor-pointer justify-center flex gap-2'>
        <FcGoogle className='text-[20px] bg-white rounded-full'/>
        <span>Continue with Google</span>
    </button>
  )
}
