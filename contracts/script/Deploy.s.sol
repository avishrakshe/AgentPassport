// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {ReputationLedger} from "../src/ReputationLedger.sol";

contract DeployScript is Script {
    function run() external returns (address registryAddr, address ledgerAddr) {
        vm.startBroadcast();

        address deployer = msg.sender;

        console2.log("==================================================");
        console2.log("Deploying Agent Passport to Monad Testnet (Chain ID 10143)...");
        console2.log("Deployer address:", deployer);
        console2.log("==================================================");

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
