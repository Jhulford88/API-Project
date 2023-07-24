import React, { useState, useEffect } from "react";
// import { useModal } from "../../context/Modal";
import { useDispatch } from "react-redux";
// import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { createBookingThunk } from "../../store/bookingsReducer";
import "./CreateBookingModal.css";

function CreateBookingModal({ spotId }) {
  // Initializing stuff
  // const { closeModal } = useModal();
  const dispatch = useDispatch();
  // const history = useHistory();

  // State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState({});
  //   const [disabled, setDisabled] = useState(true);

  // Building review object for thunk prop
  const form = {};
  form.startDate = startDate;
  form.endDate = endDate;

  // Dispatching thunk on button click
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (new Date() > new Date(startDate).getTime())
      newErrors["startDate"] = "Start date must be in the future!";
    if (!startDate) newErrors["startDate"] = "Please select a start date!";
    if (new Date(endDate) < new Date(startDate).getTime())
      newErrors["endDate"] = "End date must be after the start date!";
    if (!endDate) newErrors["endDate"] = "Please select an end date!";

    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    dispatch(createBookingThunk(form, spotId));

    return;
    // closeModal();
  };

  return (
    <div className="review-modal-container">
      <form onSubmit={handleSubmit}>
        <div className="input-field-container">
          <div className="input-label-div-left">
            <label className="date-input-label">
              CHECK-IN <span className="errors">{errors.startDate}</span>
              <input
                type="date"
                value={startDate}
                placeholder="Start Date"
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
              />
            </label>
          </div>
          <div className="input-label-div-right">
            <label className="date-input-label">
              CHECK-OUT <span className="errors">{errors.endDate}</span>
              <input
                type="date"
                value={endDate}
                placeholder="End Date"
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
              />
            </label>
          </div>
        </div>
        <div className="post-booking-button-container">
          <button
            type="submit"
            className="post-booking-button"
            //   disabled={disabled}
          >
            Reserve
          </button>
        </div>
      </form>
      <p>you wont be charged yet</p>
    </div>
  );
}

export default CreateBookingModal;
