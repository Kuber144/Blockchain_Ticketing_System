import { useState, useEffect } from "react";
import { ethers } from "ethers";
import TransferPopup from "./TransferPopup";

const Navigation = ({
  account,
  setAccount,
  tokenMaster,
  setPopupOpen,
  provider,
}) => {
  const [isOwner, setIsOwner] = useState(false);
  const [showTransferPopup, setShowTransferPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if the connected account is the owner
  const checkOwner = async (account) => {
    if (tokenMaster) {
      const owner = await tokenMaster.owner();
      setIsOwner(account === owner);
    }
  };

  useEffect(() => {
    if (account) {
      checkOwner(account);
    }
  }, [account]);

  const connectHandler = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
      checkOwner(account);
    } catch (error) {
      console.error("Error connecting wallet:", error.message);
      alert("Error connecting wallet. Please try again.");
    }
  };

  const withdrawHandler = async () => {
    try {
      if (!account) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(ethers.utils.getAddress(accounts[0]));
      }

      if (!tokenMaster) {
        throw new Error("TokenMaster contract not available");
      }

      const signer = provider.getSigner();
      const contractWithSigner = tokenMaster.connect(signer);
      await contractWithSigner.withdraw();
      alert("Withdrawal successful!");
    } catch (error) {
      console.error("Error withdrawing:", error.message);
      alert("Error withdrawing. Please try again.");
    }
  };

  const handleTransferSuccess = () => {
    setShowTransferPopup(false);
    alert("Ticket transferred successfully!");
  };

  return (
    <nav className="nav">
      <div className="nav__brand">
        <h1>tokenmaster</h1>
      </div>
      <ul className="nav__links">
        {account ? (
          <>
            <li>
              <button type="button" className="nav__connect">
                {account.slice(0, 6) + "..." + account.slice(38, 42)}
              </button>
            </li>
            <li>
              <button
                type="button"
                className="nav__create-event"
                onClick={() => setPopupOpen(true)}
              >
                Create Event
              </button>
            </li>
            {isOwner && (
              <li>
                <button
                  type="button"
                  className="nav__create-event"
                  onClick={withdrawHandler}
                >
                  Withdraw
                </button>
              </li>
            )}
            <li>
              <button
                type="button"
                className="nav__create-event"
                onClick={() => setShowTransferPopup(true)}
              >
                Transfer Ticket
              </button>
            </li>
          </>
        ) : (
          <li>
            <button
              type="button"
              className="nav__connect"
              onClick={connectHandler}
            >
              Connect Wallet
            </button>
          </li>
        )}
      </ul>
      {showTransferPopup && (
        <TransferPopup
          tokenMaster={tokenMaster}
          account={account}
          provider={provider}
          onClose={() => setShowTransferPopup(false)}
          onTransferSuccess={handleTransferSuccess}
          setErrorMessage={setErrorMessage}
        />
      )}
      {/* {errorMessage && <p className="error-message">{errorMessage}</p>} */}
    </nav>
  );
};

export default Navigation;
