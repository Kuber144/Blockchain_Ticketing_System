import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CreateEventPopup = ({ tokenMaster, account, setPopupOpen, provider }) => {
  const [eventName, setEventName] = useState("");
  const [eventCost, setEventCost] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [maxTickets, setMaxTickets] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const cost = ethers.utils.parseUnits(eventCost, "ether");
      const signer = provider.getSigner();
      const contractWithSigner = tokenMaster.connect(signer);

      const transaction = await contractWithSigner.listOccasion(
        eventName,
        cost,
        maxTickets,
        eventDate,
        eventTime,
        eventLocation
      );
      await transaction.wait();
      alert("Event created successfully!");
      setPopupOpen(false);
    } catch (error) {
      console.error("Error creating event:", error.message);
      alert("Error creating event. Please try again.");
    }
  };

  // Handle click outside of popup to close it
  const handleClickOutside = (e) => {
    if (
      !e.target.closest(".popup__content") &&
      !e.target.closest(".popup__button")
    ) {
      setPopupOpen(false);
    }
  };

  // Handle Escape key press to close the popup
  const handleEscapeKey = (e) => {
    if (e.key === "Escape") {
      setPopupOpen(false);
    }
  };

  useEffect(() => {
    // Add event listeners when the component mounts
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    // Clean up event listeners when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []); // Empty dependency array means this effect runs only once on mount

  return (
    <div className="popup">
      <div className="popup__content">
        <span className="popup__close" onClick={() => setPopupOpen(false)}>
          &times;
        </span>
        <h2>Create Event</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Event Name:
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
            />
          </label>
          <label>
            Cost (in ETH):
            <input
              type="number"
              step="0.01"
              value={eventCost}
              onChange={(e) => setEventCost(e.target.value)}
              required
            />
          </label>
          <label>
            Date:
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </label>
          <label>
            Time:
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              required
            />
          </label>
          <label>
            Location:
            <input
              type="text"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              required
            />
          </label>
          <label>
            Max Tickets:
            <input
              min="100"
              max="500"
              type="number"
              value={maxTickets}
              onChange={(e) => setMaxTickets(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="popup__button">
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPopup;
