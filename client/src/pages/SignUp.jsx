import React, { useState } from 'react'
import {Link , useNavigate} from 'react-router-dom'
import OAuth from '../components/OAuth'

export default function SignUp() {

  const [formData, setFormData] = useState({})
  const [err, setErr] = useState(null)
  const navigate = useNavigate()
  const handleChange = (e) =>{
    setFormData({
      ...formData,
      [e.target.id] : e.target.value,
    })
  }

  const handleSubmit =async (e)=>{
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/sign-up' , 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json();
      // console.log(data)
      if(data != 'User created successfully!'){
        setErr(data)
        // console.log(err)
        return;
      }
      setErr(null)
      navigate('/sign-in')
      
    } catch (error) {
      // console.log(error)
      setErr(error.message)
    }
  }
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input type="text" name="name" className='border p-3 rounded-lg text-slate-800' placeholder='username' id='username' onChange={handleChange}/>
        <input type="email" name="email" className='border p-3 rounded-lg text-slate-800' placeholder='email' id='email' onChange={handleChange}/>
        <input type="password" name="password" className='border p-3 rounded-lg text-slate-800' placeholder='password' id='password' onChange={handleChange}/>

        <button className='bg-teal-700 text-white p-3 rounded-lg uppercase hover:opacity-85 disabled:opacity-75 cursor-pointer'>Sign Up</button>
        <OAuth></OAuth>
      </form>
      <div className='flex gap-2 mt-5'>
        <p>Already have an account?</p>
        <Link to={'/sign-in'}>
          <span className='text-blue-700'>Sign In</span>
        </Link>
      </div>
      {err && <p className='mt-5 text-sm text-red-500'>ERROR: {err}</p>}
    </div>
  )
}
