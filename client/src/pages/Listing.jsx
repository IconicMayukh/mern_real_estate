import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore from 'swiper'
import { Navigation } from 'swiper/modules'
import { useSelector } from 'react-redux'
import 'swiper/css/bundle'
import { FaShare, FaMapMarkerAlt, FaBed, FaBath, FaCar, FaChair } from "react-icons/fa";
import Contact from '../components/Contact'

export default function Listing() {
    SwiperCore.use([Navigation]);
    const params = useParams()
    const [listing, setListing] = useState(null)
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const [contact, setContact] = useState(false)
    const { currentUser } = useSelector((state) => state.user.currentUser);
    useEffect(() => {
        const fetchListing = async () => {
            try {
                setLoading(true);
                setError(false);
                const res = await fetch(`/api/listing/get/${params.listingId}`);
                const data = await res.json();
                if (data.success === false) {
                    setError(true)
                    setLoading(false);
                    return;
                }

                setListing(data);
                setLoading(false)
                setError(false)
            } catch (error) {
                setLoading(false)
                setError(true)
            }
        }
        fetchListing();
    }, [params.listingId])

    return (
        <main>
            {loading && <p className='text-center my-7 text-2xl text-slate-700'>Loading...</p>}

            {error && <p className='text-center my-7 text-2xl text-red-600'>Something went wrong!</p>}

            {listing && !loading && !error && (
                <>
                    <Swiper navigation>
                        {listing.imageUrls.map((url) => (
                            <SwiperSlide key={url}>
                                <div className="h-[550px]" style={{ background: `url(${url}) center no-repeat`, backgroundSize: 'cover' }}></div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <div className="fixed top-[15%] right-[3%] z-10 border border-slate-200 rounded-full w-12 h-12 flex justify-center items-center bg-slate-100">
                        <FaShare className='text-slate-700 text-lg cursor-pointer' onClick={() => {
                            navigator.clipboard.writeText(window.location.href)
                            setCopied(true)
                            setTimeout(() => {
                                setCopied(false)
                            }, 2000);
                        }} />

                    </div>
                    {copied && (
                        <p className='fixed top-[23%] right-[3%] z-10 bg-slate-100 rounded-lg py-1 px-2 border border-slate-300 text-slate-800 text-sm transition ease-in-out duration-300'>Link copied!</p>
                    )}

                    <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
                        <p className="text-2xl font-semibold text-slate-800">{listing.name} - ₹{listing.offer ? listing.discountedPrice.toLocaleString('en-US') : listing.regularPrice.toLocaleString('en-US')} {listing.type === 'rent' && ' / month'}</p>

                        <p className="flex items-center mt-6 gap-2 text-slate-700 my-2">
                            <FaMapMarkerAlt className='text-green-600' />
                            {listing.address}
                        </p>

                        <div className="flex gap-5 items-center">
                            <p className='bg-red-600 w-full text-white text-center p-1.5 rounded-lg max-w-[240px]'>
                                {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
                            </p>

                            {listing.offer && (
                                <p className="bg-green-600 w-full text-white text-center p-1.5 rounded-lg max-w-[240px]">
                                    ₹{+listing.regularPrice - +listing.discountedPrice}  Discount
                                </p>
                            )}
                        </div>

                        <p className='text-slate-800'><span className='font-semibold text-black'>Property Description : {' '}</span>{listing.description}</p>

                        <ul className='text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6'>
                            <li className="flex items-center gap-2 whitespace-nowrap">
                                <FaBed className='text-lg text-slate-800' />
                                {listing.bedrooms > 1 ? `${listing.bedrooms} bedrooms` : `${listing.bedrooms} bedroom`}
                            </li>

                            <li className="flex items-center gap-2 whitespace-nowrap">
                                <FaBath className='text-lg text-slate-800' />
                                {listing.bathrooms > 1 ? `${listing.bathrooms} bathrooms` : `${listing.bathrooms} bathroom`}
                            </li>

                            <li className="flex items-center gap-2 whitespace-nowrap">
                                <FaCar className='text-lg text-slate-800' />
                                {listing.parking ? `Parking avilable` : `No Parking`}
                            </li>

                            <li className="flex items-center gap-2 whitespace-nowrap">
                                <FaChair className='text-lg text-slate-800' />
                                {listing.furnished ? `Furnished` : `Not Furnished`}
                            </li>
                        </ul>

                        {currentUser && listing.userRef !== currentUser._id && !contact && (
                            <button onClick={() => setContact(true)} className='bg-slate-700 text-white rounded-lg uppercase hover:opacity-90 p-3 cursor-pointer'>Contact Landlord </button>
                        )}

                        {contact && <Contact listing={listing} />}

                    </div>
                </>
            )}

        </main>
    )
}
