const hre = require("hardhat");

async function main() {
  // Deploy TokenMaster contract
  const TokenMaster = await hre.ethers.getContractFactory("TokenMaster");
  const tokenMaster = await TokenMaster.deploy("TokenMaster", "TM");
  await tokenMaster.deployed();

  console.log("TokenMaster deployed to:", tokenMaster.address);

  // Update config.json with the deployed contract address
  const network = await hre.getChainId();
  const config = {
    [network]: {
      TokenMaster: {
        address: tokenMaster.address,
      },
    },
  };

  const fs = require("fs");
  fs.writeFileSync("config.json", JSON.stringify(config, null, 2));

  // Optionally, mint some initial tokens or perform other setup
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
