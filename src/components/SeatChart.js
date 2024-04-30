import { useEffect, useState } from "react";

// Import Components
import Seat from "./Seat";

// Import Assets
import close from "../assets/close.svg";

const SeatChart = ({ occasion, tokenMaster, provider, setToggle }) => {
  const [seatsTaken, setSeatsTaken] = useState(false);
  const [hasSold, setHasSold] = useState(false);

  const getSeatsTaken = async () => {
    const seatsTakenBN = await tokenMaster.getSeatsTaken(
      occasion.id.toNumber()
    );
    const seatsTakenArr = seatsTakenBN.map((seat) => seat.toNumber()); // Convert each element to a JavaScript number
    setSeatsTaken(seatsTakenArr);
  };
  const buyHandler = async (_seat) => {
    if (seatsTaken.includes(_seat)) {
      alert("This seat is already booked by an address");
      return;
    }
    setHasSold(false);
    const signer = await provider.getSigner();

    try {
      const transaction = await tokenMaster
        .connect(signer)
        .buyTicket(occasion.id, _seat, { value: occasion.cost });
      const receipt = await transaction.wait();
      console.log(receipt);
      setHasSold(true);
    } catch (error) {
      const errorMessage = error.toString().toLowerCase();
      console.log(errorMessage);
      if (errorMessage.includes("event does not exist")) {
        alert("Event you requested does not exist");
      } else if (errorMessage.includes("event not active")) {
        alert("Event you requested is not active");
      } else if (errorMessage.includes("insufficient payment")) {
        alert("Insufficient payment. Please try again.");
      } else if (errorMessage.includes("seat number exceeds maximum")) {
        alert("Seat you requested is already taken or exceeds maximum");
      } else if (errorMessage.includes("seat already taken")) {
        alert("Seat already bought by another address");
      } else if (errorMessage.includes("action_rejected")) {
        return;
      } else {
        alert("An error occurred while buying the ticket. Please try again.");
      }
    }
  };

  useEffect(() => {
    getSeatsTaken();
  }, [hasSold]);

  return (
    <div className="occasion">
      <div className="occasion__seating">
        <h1>{occasion.name} Seating Map</h1>

        <button onClick={() => setToggle(false)} className="occasion__close">
          <img src={close} alt="Close" />
        </button>

        <div className="occasion__stage">
          <strong>STAGE</strong>
        </div>

        {seatsTaken &&
          Array(25)
            .fill(1)
            .map((e, i) => (
              <Seat
                i={i}
                step={1}
                columnStart={0}
                maxColumns={5}
                rowStart={2}
                maxRows={5}
                seatsTaken={seatsTaken}
                buyHandler={buyHandler}
                key={i}
              />
            ))}

        <div className="occasion__spacer--1 ">
          <strong>WALKWAY</strong>
        </div>

        {seatsTaken &&
          Array(Number(occasion.maxTickets) - 50)
            .fill(1)
            .map((e, i) => (
              <Seat
                i={i}
                step={26}
                columnStart={6}
                maxColumns={15}
                rowStart={2}
                maxRows={15}
                seatsTaken={seatsTaken}
                buyHandler={buyHandler}
                key={i}
              />
            ))}

        <div className="occasion__spacer--2">
          <strong>WALKWAY</strong>
        </div>

        {seatsTaken &&
          Array(25)
            .fill(1)
            .map((e, i) => (
              <Seat
                i={i}
                step={Number(occasion.maxTickets) - 24}
                columnStart={22}
                maxColumns={5}
                rowStart={2}
                maxRows={5}
                seatsTaken={seatsTaken}
                buyHandler={buyHandler}
                key={i}
              />
            ))}
      </div>
    </div>
  );
};

export default SeatChart;
