const { expect } = require("chai");
const { ethers } = require("hardhat");

const NAME = "TokenMaster";
const SYMBOL = "TM";

const OCCASION_NAME = "ETH Texas";
const OCCASION_COST = ethers.utils.parseUnits("1", "ether");
const OCCASION_MAX_TICKETS = 100;
const OCCASION_DATE = "Apr 27";
const OCCASION_TIME = "10:00AM CST";
const OCCASION_LOCATION = "Austin, Texas";

describe("TokenMaster", () => {
  let tokenMaster;
  let deployer, buyer;

  beforeEach(async () => {
    // Setup accounts
    [deployer, buyer] = await ethers.getSigners();

    // Deploy contract
    const TokenMaster = await ethers.getContractFactory("TokenMaster");
    tokenMaster = await TokenMaster.deploy(NAME, SYMBOL);

    const transaction = await tokenMaster
      .connect(deployer)
      .listOccasion(
        OCCASION_NAME,
        OCCASION_COST,
        OCCASION_MAX_TICKETS,
        OCCASION_DATE,
        OCCASION_TIME,
        OCCASION_LOCATION
      );

    await transaction.wait();
  });

  describe("Deployment and Occasion Listing", () => {
    it("Deploys the contract and lists an occasion", async () => {
      // Check contract deployment
      expect(await tokenMaster.name()).to.equal(NAME);
      expect(await tokenMaster.symbol()).to.equal(SYMBOL);
      expect(await tokenMaster.owner()).to.equal(deployer.address);

      // Check occasion listing
      const occasion = await tokenMaster.getOccasion(1);
      expect(occasion.id).to.be.equal(1);
      expect(occasion.name).to.be.equal(OCCASION_NAME);
      expect(occasion.cost).to.be.equal(OCCASION_COST);
      expect(occasion.tickets).to.be.equal(OCCASION_MAX_TICKETS);
      expect(occasion.date).to.be.equal(OCCASION_DATE);
      expect(occasion.time).to.be.equal(OCCASION_TIME);
      expect(occasion.location).to.be.equal(OCCASION_LOCATION);
    });
  });

  describe("Ticket Purchase and Transfer", () => {
    const EVENT_ID = 1;
    const SEAT = 50;
    const AMOUNT = ethers.utils.parseUnits("1", "ether");

    beforeEach(async () => {
      const transaction = await tokenMaster
        .connect(buyer)
        .buyTicket(EVENT_ID, SEAT, { value: AMOUNT });
      await transaction.wait();
    });

    it("Allows buying a ticket", async () => {
      const occasion = await tokenMaster.getOccasion(EVENT_ID);
      expect(occasion.tickets).to.be.equal(OCCASION_MAX_TICKETS - 1);
      const ticket = await tokenMaster.tickets(
        await tokenMaster.getTicketIdentifier(buyer.address, EVENT_ID)
      );
      expect(ticket.eventId).to.equal(EVENT_ID);
      expect(ticket.buyer).to.equal(buyer.address);
      expect(ticket.seat).to.equal(SEAT);
    });

    it("Allows transferring a ticket", async () => {
      const recipient = ethers.Wallet.createRandom().address;
      const transferTransaction = await tokenMaster
        .connect(buyer)
        .transferTicket(
          await tokenMaster.getTicketIdentifier(buyer.address, EVENT_ID),
          recipient
        );
      await transferTransaction.wait();

      const ownerAfterTransfer = await tokenMaster.ownerOf(EVENT_ID);
      expect(ownerAfterTransfer).to.equal(recipient);

      const ticket = await tokenMaster.tickets(
        await tokenMaster.getTicketIdentifier(buyer.address, EVENT_ID)
      );
      expect(ticket.locked).to.equal(false);
    });
  });

  describe("Event Deactivation", () => {
    it("Allows the owner to deactivate an event", async () => {
      const transaction = await tokenMaster
        .connect(deployer)
        .deactivateEvent(1, { gasLimit: 3000000 });
      await transaction.wait();

      const occasion = await tokenMaster.getOccasion(1);
      expect(occasion.active).to.be.equal(false);
    });

    it("Prevents non-owner from deactivating an event", async () => {
      await expect(
        tokenMaster.connect(buyer).deactivateEvent(1, { gasLimit: 3000000 })
      ).to.be.revertedWith("You are not the organizer of this event");
    });
  });

  describe("Withdrawal", () => {
    it("Allows the owner to withdraw contract balance", async () => {
      const initialBalance = await ethers.provider.getBalance(deployer.address);

      // Buy a ticket to increase contract balance
      await tokenMaster.connect(buyer).buyTicket(1, 1, {
        value: ethers.utils.parseUnits("1", "ether"),
        gasLimit: 3000000,
      });

      const withdrawalTransaction = await tokenMaster
        .connect(deployer)
        .withdraw({ gasLimit: 3000000 });
      await withdrawalTransaction.wait();

      const finalBalance = await ethers.provider.getBalance(deployer.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Prevents non-owner from withdrawing contract balance", async () => {
      await expect(
        tokenMaster.connect(buyer).withdraw({ gasLimit: 3000000 })
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  // Additional tests can be added as needed...
});
