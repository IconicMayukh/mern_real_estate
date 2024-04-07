import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { app } from '../firebase'
import { updateUserStart, updateUserFailure, updateUserSuccess, deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutUserSuccess, signOutUserFailure, signOutUserStart } from '../redux/user/userSlice'
import { Link } from 'react-router-dom'



export default function Profile() {
  const fileRef = useRef(null)
  const { currentUser, loading, error } = useSelector((state) => state.user)
  const [file, setFile] = useState(undefined)
  const [filePerc, setFilePerc] = useState(0)
  const [fileError, setFileError] = useState(false)
  const [formData, setFormData] = useState({})
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [showListingError, setShowListingError] = useState(false)
  const [userListings, setUserListings] = useState({})
  const dispatch = useDispatch()

  const handleFileUpload = () => {
    const storage = getStorage(app)
    const fileName = new Date().getTime() + file.name
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      setFilePerc(Math.round(progress));
      console.log(filePerc)
    }, (error) => {
      setFileError(true)
    }, () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        setFormData({ ...formData, avatar: downloadURL })
      })
    })
  }

  useEffect(() => {
    if (file) {
      handleFileUpload();
    }
  }, [file])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true)
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  }

  const handleDelete = async () => {
    try {
      dispatch(deleteUserStart())
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message))
        return;
      }
      dispatch(deleteUserSuccess(data))
    } catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  }

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart())
      const res = await fetch('/api/auth/sign-out') //default get so no need to specify!
      const data = await res.json()
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message))
        return;
      }
      dispatch(signOutUserSuccess(data))
    } catch (error) {
      dispatch(signOutUserFailure(error.message))
    }
  }

  const handleShowListings = async () => {
    setShowListingError(false)
    try {
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();

      if (data.success === false) {
        setShowListingError(true)
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingError(true);
    }
  }

  const handleListingDelete = async (listingId)=>{
    try {
      const res = await fetch(`/api/listings/delete/${listingId}`, {
        method: "DELETE",
      })
      
      const data = await res.json();
      if(data.success === false){
        console.log(data.message);
        return;
      }
      
      setUserListings((prev)=>{
        prev.filter((listing)=> listing._id !== listingId);
      })
    } catch (error) {
      console.log(error)
    }
  } 

  return (
    <div className='p-5 max-w-lg mx-auto'>
      <h1 className='mb-3 text-3xl font-semibold text-center'>Profile</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <input onChange={(e) => setFile(e.target.files[0])} type="file" ref={fileRef} accept='image/*' hidden />
        <img onClick={() => fileRef.current.click()} src={formData.avatar || currentUser.avatar} alt="profile" className='mb-3 rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2' />
        <p className='text-sm self-center'>
          {fileError ? (<span className='text-red-600'>Error Image upload</span>) : filePerc > 0 && filePerc < 100 ? (<span className='text-slate-600'>{`Uploading ${filePerc}%`}</span>) : filePerc === 100 ? (<span className='text-green-500'>Image successfully uploaded!</span>) : ""}
        </p>
        <input type="text" name="username" id="username" placeholder='username' className='border p-3 rounded-lg' defaultValue={currentUser.username} onChange={handleChange} />
        <input type="text" name="email" id="email" placeholder='email' className='border p-3 rounded-lg' defaultValue={currentUser.email} onChange={handleChange} />
        <input type="password" name="password" id="password" placeholder='password' className='border p-3 rounded-lg' onChange={handleChange} />
        <button disabled={loading} className='bg-slate-700 text-white rounded-xl uppercase hover:opacity-95 disabled:opacity-80 cursor-pointer p-2'>{loading ? "loading..." : "Update"}</button>

        <Link to={'/create-listing'} className='bg-green-600 text-white uppercase rounded-xl text-center hover:opacity-95 p-2 cursor-pointer'>Create Listing</Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span className='text-red-600 cursor-pointer' onClick={handleDelete}>Delete Account</span>
        <span className='text-red-600 cursor-pointer' onClick={handleSignOut}>Sign Out</span>
      </div>
      <p className='text-red-600 mt-2 text-base text-center'>{error ? error : ""}</p>
      <p className='text-green-500 mt-2 text-base text-center'>{updateSuccess ? "User details updated sucessfully!" : ""}</p>

      <button onClick={()=> handleShowListings()} className='text-green-600 w-full'>Show Listings</button>
      <p className='text-red-600 mt-5'>{showListingError ? 'Error showing listings' : ''}</p>

      {userListings && userListings.length > 0 &&
        <div className='flex flex-col gap-4'>
          <h1 className="text-center mt-7 mb-3 text-2xl font-semibold">Your Listings</h1>
          {userListings.map((listing) => (
            <div key={listing._id} className='border rounded-lg p-3 flex justify-between items-center'>
              <Link to={`/listing/${listing._id}`}>
                <img src={listing.imageUrls[0]} alt="listing cover" className='h-16 w-16 object-contain' />
              </Link>
              <Link to={`/listing/${listing._id}`} className='text-slate-700 font-semibold flex-1 hover:underline truncate pl-4'>
                <p>{listing.name}</p>
              </Link>

              <div className="flex flex-col items-center">
                <button onClick={()=> handleListingDelete(listing._id)} className='text-red-600 uppercase cursor-pointer'>Delete</button>
                <Link to={`/update-listing/${listing._id}`}>
                <button className='text-green-600 uppercase cursor-pointer'>Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>}
    </div>
  )
}
