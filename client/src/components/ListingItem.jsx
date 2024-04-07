import React from 'react'
import { Link } from 'react-router-dom'
import {MdLocationOn} from 'react-icons/md'

export default function ListingItem({listing}) {
  return (
    <div className='bg-white shadow-md hover:shadow-lg transition-all overflow-hidden rounded-lg duration-100 w-full sm:w-[330px]'>
      <Link to={`/listing/${listing._id}`}>
        <img src={listing.imageUrls[0]} alt={listing.name} className='h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-all duration-300 ease-in-out'/>

        <div className="p-3 flex flex-col gap-2 w-full">
          <p className="text-lg truncate font-semibold text-slate-700">{listing.name}</p>
          <div className="flex items-center gap-1">
            <MdLocationOn className='h-4 w-4 text-green-600'/>
            <p className="text-sm text-gray-600 truncate w-full">{listing.address}</p>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>

          <p className="text-slate-600 mt-2 font-semibold flex items-center">
          ₹ {listing.offer? listing.discountedPrice.toLocaleString('en-US') : listing.regularPrice.toLocaleString('en-US')} {listing.type === 'rent' && '/month'}
          </p>
          <div className="text-slate-700 flex gap-3">
            <div className="font-bold text-xs ">
              {listing.bedrooms > 1 ? `${listing.bedrooms} bedrooms` : `${listing.bedrooms} bedroom`}
            </div>
            <div className="font-bold text-xs ">
              {listing.bathrooms > 1 ? `${listing.bathrooms} bathrooms` : `${listing.bathrooms} bathroom`}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
