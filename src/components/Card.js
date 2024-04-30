import { useState, useEffect } from "react";
import { ethers } from "ethers";

const Card = ({
  occasion,
  toggle,
  setToggle,
  setOccasion,
  account,
  creator,
  tokenMaster,
  provider,
}) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if user is connected when the component mounts

    if (account) {
      setIsConnected(true);
    }
  }, [account]); // Only re-run when account changes

  const togglePop = () => {
    setOccasion(occasion);
    toggle ? setToggle(false) : setToggle(true);
  };

  const disableEvent = async () => {
    if (!account) {
      // User is not connected, handle this case
      console.error("User is not connected to an Ethereum wallet");
      return;
    }

    try {
      const signer = provider.getSigner();
      const contractWithSigner = tokenMaster.connect(signer);
      await contractWithSigner.deactivateEvent(occasion.id);
      alert("Event disabled successfully");
    } catch (error) {
      console.error("Error disabling event:", error);
    }
  };

  return (
    <div className="card">
      <div className="card__info">
        <p className="card__date">
          <strong>Date: {occasion.date}</strong>
          <br />
          Time: {occasion.time}
          <br />
          Event ID: {occasion.id.toNumber()}
        </p>

        <h3 className="card__name">{occasion.name}</h3>

        <p className="card__location">
          <small>{occasion.location}</small>
        </p>

        <p className="card__cost">
          <strong>
            {ethers.utils.formatUnits(occasion.cost.toString(), "ether")}
          </strong>
          ETH
        </p>

        {/* Show disable button if current account is the creator of the event */}
        {account &&
          account.toLowerCase() === occasion.organizer.toLowerCase() && (
            <button
              type="button"
              className="card__button--disable"
              onClick={disableEvent}
            >
              Disable Event
            </button>
          )}

        {isConnected ? (
          <button
            type="button"
            className="card__button"
            onClick={() => togglePop()}
          >
            View Seats
          </button>
        ) : (
          <button type="button" className="card__button card__button--connect">
            Connect Wallet
          </button>
        )}
      </div>

      <hr />
    </div>
  );
};

export default Card;
