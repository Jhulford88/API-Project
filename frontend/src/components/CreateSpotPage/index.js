import React, { useState, useEffect } from 'react';
import "./CreateSpotPage.css"
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createSpot } from '../../store/spotsReducer';
import { createSpotImage } from '../../store/spotsReducer';


function CreateSpotPage(){
    const history = useHistory();
    const [country, setCountry] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [description, setDescription] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [image1, setImage1] = useState('');
    const [image2, setImage2] = useState('');
    const [image3, setImage3] = useState('');
    const [image4, setImage4] = useState('');
    const [errors, setErrors] = useState({});////////////////////////////////////////////////////////////////
    const dispatch = useDispatch();
    const sessionUser = useSelector(state => state.session.user);
    const form = {country, address, city, state, description, name, price};

    //conditionally add all photos to an array
    const imageArr = []
    if(previewImage) imageArr.push({url: previewImage, preview: true});
    if(image1) imageArr.push({url: image1, preview: false});
    if(image2) imageArr.push({url: image2, preview: false});
    if(image3) imageArr.push({url: image3, preview: false});
    if(image4) imageArr.push({url: image4, preview: false});



    const isDisabled = Object.keys(errors).length ? true : false

    const handleSubmit = async (e) => {

        e.preventDefault();
        // setErrors({});
        const newSpot = await dispatch(createSpot(form, imageArr, sessionUser))

        // if (newSpot.errors) {
        //     setErrors(newSpot.errors)
        // }

        history.push(`/spots/${newSpot.id}`);
    };

    useEffect(() => {
        const newErrors = {};
        if(country.length < 1) newErrors['country'] = 'Country is required'


        setErrors(newErrors)
      }, [country, city, state, address, description, name, price, previewImage])

  return (
    <div className='form-container'>
        <form className='form' onSubmit={handleSubmit}>
            <div className='form-section-1'>
                <h2>Create a new Spot</h2>
                <h3>Where's your place located?</h3>
                <p>Guests will only get your exact address once they booked a reservation</p>
                <label>
                    Country {errors.country}
                    <input
                        type="text"
                        value={country}
                        placeholder="Country"
                        onChange={(e) => setCountry(e.target.value)}
                    />
                </label>
                <label>
                    Street Address
                    <input
                        type="text"
                        value={address}
                        placeholder="Address"
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </label>
                <label>
                    City
                    <input
                        type="text"
                        value={city}
                        placeholder="City"
                        onChange={(e) => setCity(e.target.value)}
                    />
                </label>
                <label>
                    State
                    <input
                        type="text"
                        value={state}
                        placeholder="State"
                        onChange={(e) => setState(e.target.value)}
                    />
                </label>
            </div>
            <div className='form-section-2'>
                <h3>Describe your place to guests</h3>
                <p>Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.</p>
                <textarea
                    value={description}
                    placeholder="Please type at least 30 characters"
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div className='form-section-3'>
                <h3>Create a title for your spot</h3>
                <p>Catch guests' attention with a spot title that highlights what makes your place special</p>
                <input
                    type="text"
                    value={name}
                    placeholder="Name of your spot"
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div>
                <h3>Set a base price for your spot</h3>
                <p>Competitive pricing can help your listing stand out and rank higher in search results</p>
                $
                <input
                    type="number"
                    value={price}
                    placeholder="Price per night (USD)"
                    onChange={(e) => setPrice(e.target.value)}
                />
            </div>
            <div className='form-section-4'>
                <h3>Liven up your spot with photos</h3>
                <p>Submit a link to at least one photo to publish your spot</p>
                <input type="text" value={previewImage} placeholder="Preview image url" onChange={(e) => setPreviewImage(e.target.value)}/>
                <input type="text" value={image1} placeholder="Image url" onChange={(e) => setImage1(e.target.value)}/>
                <input type="text" value={image2} placeholder="Image url" onChange={(e) => setImage2(e.target.value)}/>
                <input type="text" value={image3} placeholder="Image url" onChange={(e) => setImage3(e.target.value)}/>
                <input type="text" value={image4} placeholder="Image url" onChange={(e) => setImage4(e.target.value)}/>
            </div>
            <button className='create-spot-submit-button' type='submit' disabled={isDisabled}>Create Spot</button>
        </form>
    </div>
  );
}

export default CreateSpotPage;
