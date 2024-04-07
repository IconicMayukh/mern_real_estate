import React, { useState } from 'react'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { app } from '../firebase.js'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'


export default function CreateListing() {
    const navigate = useNavigate()
    const { currentUser } = useSelector(state => state.user)
    const [files, setFiles] = useState({})
    const [formData, setFormData] = useState({ imageUrls: [], name: '', description: '', address: '', type: 'rent', bedrooms: 1, bathrooms: 1, regularPrice: 0, discountedPrice: 0, offer: false, parking: false, furnished: false, })
    const [imageUploadError, setImageUploadError] = useState(false)
    const [uploading, setUpLoading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const storeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const filename = new Date().getTime() + file.name;
            const storageRef = ref(storage, filename)
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on('state_changed', (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            }, (error) => {
                reject(error)
            }, () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                })
            })
        })
    }

    const handleImageSubmit = (e) => {
        if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
            setUpLoading(true)
            setImageUploadError(false)
            const promises = [];

            for (let i = 0; i < files.length; i++) {
                promises.push(storeImage(files[i]));
            }
            Promise.all(promises).then((urls) => {
                setFormData({ ...formData, imageUrls: formData.imageUrls.concat(urls) })

                setImageUploadError(false);
                setUpLoading(false)
            }).catch((error) => {
                setImageUploadError(error.message);
                setUpLoading(false)
            })
        }
        else {
            setImageUploadError("You can only upload maximum 6 images!")
            setUpLoading(false)
        }
    }

    const handleImageDelete = (idx) => {
        setFormData({ ...formData, imageUrls: formData.imageUrls.filter((_, i) => i !== idx), })
    }


    const handleChange = (e) => {
        if (e.target.id === 'sale' || e.target.id === 'rent') {
            setFormData({ ...formData, type: e.target.id })
        }
        if (e.target.id === 'furnished' || e.target.id === 'parking' || e.target.id === 'offer') {
            setFormData({ ...formData, [e.target.id]: e.target.checked })
        }
        if (e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea') {
            setFormData({ ...formData, [e.target.id]: e.target.value })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(false)
            setLoading(true);
            if (formData.imageUrls.length < 1) {
                setError('You must upload atleast one image!')
                setLoading(false)
                return;
            }
            if (+formData.regularPrice < +formData.discountedPrice) {
                setError("Discount price must be less than regular price!")
                setLoading(false)
                return;
            }
            const res = await fetch('/api/listing/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    userRef: currentUser._id,
                }),
            })
            const data = await res.json()
            setLoading(false)
            if (data.success === false) {
                setError(data.message)
                setLoading(false)
            }
            navigate(`/listing/${data._id}`);
        } catch (error) {
            setError(error.message)
            setLoading(false)
        }
    }


    console.log(formData)
    return (
        <main className='p-3 max-w-5xl mx-auto'>
            <h1 className='text-3xl font-semibold text-center my-7'>Create a Listing</h1>
            <form className='flex flex-col sm:flex-row gap-16' onSubmit={handleSubmit}>
                <div className='flex flex-col gap-4 flex-1'>
                    <input type="text" name="name" id="name" placeholder='Name of property...' className='border p-3 rounded-lg' maxLength={62} minLength={10} required onChange={handleChange} value={formData.name} />
                    <textarea type="text" name="description" id="description" placeholder='Description of property...' className='border p-3 rounded-lg' required onChange={handleChange} value={formData.description} />
                    <input type="text" name="address" id="address" placeholder='Address of property...' className='border p-3 rounded-lg' maxLength={62} minLength={10} required onChange={handleChange} value={formData.address} />


                    <div className="flex gap-2 border border-slate-200 rounded-xl p-1">
                        <div className={`flex-1 rounded-xl p-2 text-center cursor-pointer transition-all duration-200 ease-in-out hover:opacity-90 ${formData.type === 'rent' ? 'bg-slate-600 rounded-xl text-white' : "bg-transparent text-black"}`} id='rent' onClick={handleChange}>Rent</div>
                        <div className={`flex-1  rounded-xl p-2 text-center cursor-pointer transition-all duration-200 ease-in-out hover:opacity-90 ${formData.type === 'sale' ? "bg-slate-600 text-white" : "bg-transparent text-black"}`} id='sale' onClick={handleChange}>Sell</div>
                    </div>



                    <div className='flex gap-6 flex-wrap pt-2 justify-between'>
                        {/* <div className="flex gap-2">
                            <input type="checkbox" name="sale" id="sale" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.type === 'sale'} />
                            <span>Sell</span>
                        </div>

                        <div className="flex gap-2">
                            <input type="checkbox" name="rent" id="rent" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.type === 'rent'} />
                            <span>Rent</span>
                        </div> */}
                        <div className="flex gap-2">
                            <input type="checkbox" name="parking" id="parking" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.parking} />
                            <span>Parking</span>
                        </div>
                        <div className="flex gap-2">
                            <input type="checkbox" name="furnished" id="furnished" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.furnished} />
                            <span>Furnished</span>
                        </div>
                        <div className="flex gap-2">
                            <input type="checkbox" name="offer" id="offer" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.offer} />
                            <span>Offer</span>
                        </div>

                    </div>

                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <input type="number" name="bedrooms" id="bedrooms" min={1} max={10} required className='p-3 border border-gray-300 rounded-lg' onChange={handleChange} value={formData.bedrooms} />
                            <p>Bedrooms</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="number" name="bathrooms" id="bathrooms" min={1} max={10} required className='p-3 border border-gray-300 rounded-lg' onChange={handleChange} value={formData.bathrooms} />
                            <p>Bathrooms</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="number" name="regularPrice" id="regularPrice" min={0} required className='p-3 border border-gray-300 rounded-lg' onChange={handleChange} value={formData.regularPrice} />
                            <div className="flex items-center flex-col">
                                <p>Regular Price</p>
                                <span className='text-xs'>{formData.type === 'rent' ? "₹ / month" : '₹ Only'}</span>
                            </div>
                        </div>
                        {formData.offer && (
                            <div className="flex items-center gap-2">
                                <input type="number" name="discountedPrice" id="discountedPrice" min={0} required className='p-3 border border-gray-300 rounded-lg' onChange={handleChange} value={formData.discountedPrice} />
                                <div className="flex items-center flex-col">
                                    <p>Discounted Price</p>
                                    <span className='text-xs'>{formData.type === 'rent' ? "₹ / month" : '₹ Only'}</span>
                                </div>
                            </div>

                        )}
                    </div>
                </div>

                <div className="flex flex-col flex-1 gap-4">
                    <p className="font-semibold">Images:
                        <span className='font-normal text-gray-600 ml-2'>The first image will be the cover (max 6)</span>
                    </p>
                    <div className="flex gap-4">
                        <input onChange={(e) => setFiles(e.target.files)} className='p-3 border border-gray-300 rounded w-full' type="file" id='images' accept='image/*' multiple />
                        <button onClick={handleImageSubmit} disabled={uploading} type='button' className='p-3 text-green-600 border border-green-600 rounded uppercase hover:shadow-lg disabled:opacity-80 cursor-pointer hover:opacity-95 text-center disabled:cursor-not-allowed'>{uploading ? 'Uploading...' : 'Upload'}</button>
                    </div>
                    <p className='text-sm text-red-600'>{imageUploadError && imageUploadError}</p>
                    {formData.imageUrls.length > 0 && formData.imageUrls.map((url, i) => (
                        <div className="flex justify-between p-3 border rounded-lg items-center border-slate-200" key={url}>
                            <img src={url} alt={`image ${i}`} className='w-20 h-20 object-contain rounded-lg' />
                            <button className='p-3 text-red-600 rounded-lg uppercase hover:opacity-70 cursor-pointer' type='button' onClick={() => handleImageDelete(i)}>Delete</button>
                        </div>
                    ))}
                    <button disabled={loading || uploading} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80 cursor-pointer text-center disabled:cursor-not-allowed'>{loading ? 'Creating...' : 'Create Lisitng'}</button>
                    {error && (<p className='text-sm text-red-600'> {error}</p>)}
                </div>
            </form>
        </main>
    )
}
