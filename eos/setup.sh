#!/bin/bash

echo | nohup nodeos -e -p eosio --plugin eosio::wallet_api_plugin --plugin eosio::wallet_plugin --plugin eosio::producer_plugin --plugin eosio::history_plugin --plugin eosio::chain_api_plugin --plugin eosio::history_api_plugin --plugin eosio::http_plugin -d /mnt/dev/data --config-dir /mnt/dev/config --http-server-address=0.0.0.0:8888 --access-control-allow-origin=* --contracts-console > /root/nodeos.err 2> /root/nodeos.log &

# Create wallet and show password
WALLET_RES="$(cleos wallet create)"
WALLET_PWD="$(grep -oP '(?<=\")(.*)(?=\")' <<< "$WALLET_RES")"
echo Wallet password: ${WALLET_PWD}

# Import eosio default key for the eos-dev docker image into the default wallet
echo "Importing eosio key into the new wallet..."
cleos wallet import 5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3

cd smart-contracts/user
eosiocpp -o user.wast user.cpp
eosiocpp -g user.abi user.cpp
cleos set contract eosio . user.wast user.abi
