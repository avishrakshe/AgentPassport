// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {ReputationLedger} from "../src/ReputationLedger.sol";

contract DeployScript is Script {
    function run() external returns (address registryAddr, address ledgerAddr) {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("==================================================");
        console2.log("Deploying Agent Passport to Monad...");
        console2.log("Deployer address:", deployer);
        console2.log("==================================================");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy AgentRegistry with deployer as initial verifier
        AgentRegistry registry = new AgentRegistry(deployer);
        registryAddr = address(registry);

        // 2. Deploy ReputationLedger linked to AgentRegistry
        ReputationLedger ledger = new ReputationLedger(registryAddr);
        ledgerAddr = address(ledger);

        vm.stopBroadcast();

        console2.log("AgentRegistry deployed at:   ", registryAddr);
        console2.log("ReputationLedger deployed at:", ledgerAddr);
        console2.log("==================================================");
    }
}
