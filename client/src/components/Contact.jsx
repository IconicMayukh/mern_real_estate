import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Contact({listing}) {
    const [landlord, setLandlord] = useState(null)
    const [message, setMessage] = useState('')
    console.log(listing)

    useEffect(() => {
      const fetchLandlord = async ()=>{
        try {
            const res = await fetch(`/api/user/${listing.userRef}`)
            const data = await res.json()
            setLandlord(data);
        } catch (error) {
            console.log(error)
        }
      }

      fetchLandlord()
    }, [listing])

    const onChange = (e)=>{
        setMessage(e.target.value);
    }
    
  return (
    <>
      {landlord && (
        <div className="text-slate-700">
            <p>Contact <span className='font-semibold'>{landlord.username}</span> for <span className='font-semibold'>{listing.name}</span></p>
            <textarea name="message" id="message" cols="30" rows="2" value={message} onChange={onChange} placeholder='Enter your message here...' className='w-full border p-3 rounded-lg text-slate-800'></textarea>

            <Link to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`} className='bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-90 cursor-pointer'>Send Message</Link>
        </div>
      )}
    </>
  )
}
