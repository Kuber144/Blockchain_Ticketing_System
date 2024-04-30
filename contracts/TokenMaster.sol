// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
      // "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3"
//OLDER ONE: 
contract TokenMaster is ERC721 {
    address public owner;
    uint256 public totalOccasions;
    uint256 public totalSupply;
    struct Occasion {
        uint256 id;
        address organizer; // Address of the event organizer
        string name;
        uint256 cost;
        uint256 tickets;
        uint256 maxTickets;
        string date;
        string time;
        string location;
        bool active;
    }

    struct Ticket {
        uint256 eventId;
        address buyer;
        uint256 seat;
        bool locked;
        uint256 lockExpiration;
    }

    mapping(uint256 => Occasion) occasions;
    mapping(uint256 => mapping(uint256 => address)) public seatTaken;
    mapping(uint256 => uint256[]) public seatsTaken;
    mapping(bytes32 => Ticket) public tickets;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        owner = msg.sender;
    }

    function listOccasion(
        string memory _name,
        uint256 _cost,
        uint256 _maxTickets,
        string memory _date,
        string memory _time,
        string memory _location
    ) external {
        require(_cost > 0, "Cost must be greater than 0");
        require(_maxTickets > 0, "Max tickets must be greater than 0");

        totalOccasions++;
        Occasion storage newOccasion = occasions[totalOccasions];
        newOccasion.id = totalOccasions;
        newOccasion.organizer = msg.sender;
        newOccasion.name = _name;
        newOccasion.cost = _cost;
        newOccasion.tickets = _maxTickets;
        newOccasion.maxTickets = _maxTickets;
        newOccasion.date = _date;
        newOccasion.time = _time;
        newOccasion.location = _location;
        newOccasion.active = true;
    }

    function buyTicket(uint256 _eventId, uint256 _seat) external payable {
    require(_eventId <= totalOccasions, "Event does not exist");
    require(occasions[_eventId].active, "Event not active");
    require(msg.value >= occasions[_eventId].cost, "Insufficient payment");
    require(_seat < occasions[_eventId].maxTickets, "Seat number exceeds maximum");

    // Check if the user already has a ticket for this event
    bytes memory userEventTicketId = abi.encodePacked(msg.sender, _eventId);
    // require(tickets[keccak256(userEventTicketId)].buyer == address(0), "Already bought a ticket for this event");

    bytes memory ticketId = abi.encodePacked(msg.sender, _eventId);
    bytes32 ticketHash = keccak256(ticketId);
    Ticket storage newTicket = tickets[ticketHash];
    require(!newTicket.locked || block.timestamp >= newTicket.lockExpiration, "Ticket locked");

    uint256 lockPeriod = 1 hours; // Define the lock period, adjust as needed
    newTicket.eventId = _eventId;
    newTicket.buyer = msg.sender;
    newTicket.seat = _seat;
    newTicket.locked = false;
    newTicket.lockExpiration = block.timestamp + lockPeriod;

    occasions[_eventId].tickets--;
    seatTaken[_eventId][_seat] = msg.sender;
    seatsTaken[_eventId].push(_seat);

    totalSupply++;

    // _safeMint(msg.sender, totalSupply);
}


    function transferTicket(bytes32 _ticketIdentifier, address _to) external {
        Ticket storage ticket = tickets[_ticketIdentifier];
        require(msg.sender == ownerOf(ticket.eventId), "You are not the owner of this ticket");
        require(!ticket.locked || block.timestamp >= ticket.lockExpiration, "Ticket locked");

        _transfer(msg.sender, _to, ticket.eventId);
        ticket.locked = false;
    }

    function deactivateEvent(uint256 _eventId) external {
        require(msg.sender == occasions[_eventId].organizer, "You are not the organizer of this event");
        require(occassions[_eventId].date > block.timestamp, "Event has already passed");
        occasions[_eventId].active = false;
    }

    function getOccasion(uint256 _id) public view returns (Occasion memory) {
        return occasions[_id];
    }

    function getSeatsTaken(uint256 _id) public view returns (uint256[] memory) {
        return seatsTaken[_id];
    }

    function withdraw() external onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    function getTicketIdentifier(address _buyer, uint256 _eventId) public view returns (bytes32) {
        return keccak256(abi.encodePacked(_buyer, _eventId));
    }
    function getTicket(bytes32 _ticketIdentifier) public view returns (Ticket memory) {
        return tickets[_ticketIdentifier];
    }
    function getTicketBuyer(bytes32 _ticketIdentifier) public view returns (address) {
        return tickets[_ticketIdentifier].buyer;
    }
}
