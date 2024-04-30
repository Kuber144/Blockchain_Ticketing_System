import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const TransferPopup = ({
  tokenMaster,
  account,
  provider,
  onClose,
  onTransferSuccess,
  setErrorMessage,
}) => {
  const [eventId, setEventId] = useState("");
  const [toAddress, setToAddress] = useState("");

  const transferTicketHandler = async () => {
    try {
      const eventIdInt = parseInt(eventId);
      const toAddressFormatted = ethers.utils.getAddress(toAddress);

      // Check if event exists
      const occasion = await tokenMaster.getOccasion(eventIdInt);
      if (!occasion.active) {
        alert("Event does not exist or is not active");
        return;
      }

      // Fetch ticket identifier
      const ticketIdentifier = await tokenMaster.getTicketIdentifier(
        account,
        eventIdInt
      );
      console.log(ticketIdentifier);
      // Transfer ticket
      const signer = provider.getSigner();
      const contractWithSigner = tokenMaster.connect(signer);
      await contractWithSigner.transferTicket(
        ticketIdentifier,
        toAddressFormatted
      );

      onTransferSuccess(); // Callback to parent component
    } catch (error) {
      console.error("Error transferring ticket:", error.message);
      alert("Error transferring ticket. Please try again.");
    }
  };

  // Close the popup when Escape key is pressed
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  // Close the popup when clicking outside
  const handleOutsideClick = (event) => {
    if (!event.target.closest(".popup__content")) {
      onClose();
    }
  };

  // Add event listeners when the component mounts
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleOutsideClick);

    // Cleanup event listeners when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="popup">
      <div className="popup__content">
        <span className="popup__close" onClick={onClose}>
          &times;
        </span>
        <h2>Transfer Ticket</h2>
        <input
          type="text"
          placeholder="Enter Event ID"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Address to Transfer To"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
        />
        <button type="button" onClick={transferTicketHandler}>
          Transfer
        </button>
      </div>
    </div>
  );
};

export default TransferPopup;
