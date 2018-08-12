#!/bin/bash
echo | nohup nodeos -e -p eosio --plugin eosio::wallet_api_plugin --plugin eosio::wallet_plugin --plugin eosio::producer_plugin --plugin eosio::history_plugin --plugin eosio::chain_api_plugin --plugin eosio::history_api_plugin --plugin eosio::http_plugin -d /mnt/dev/data --config-dir /mnt/dev/config --http-server-address=0.0.0.0:8888 --access-control-allow-origin=* --http-validate-host=false --contracts-console > /root/nodeos.err 2> /root/nodeos.log &

# Create wallet and show password
WALLET_RES="$(cleos wallet create)"
WALLET_PWD="$(grep -oP '(?<=\")(.*)(?=\")' <<< "$WALLET_RES")"
echo Default wallet password: ${WALLET_PWD}

# Import eosio default key for the eos-dev docker image into the default wallet
echo "Importing eosio key into the new wallet..."
cleos wallet import --private-key $EOS_EOSIO_PRIVATE_KEY

echo "Creating Consensus Clubs user..."
sleep 5
cleos create account eosio $EOS_USERNAME $EOS_USER_PUBLIC_KEY $EOS_USER_PUBLIC_KEY

echo "Importing conclubs key..."
cleos wallet import --private-key $EOS_USER_PRIVATE_KEY

echo "Building and deploying contracts..."
cd smart-contracts
eosiocpp -o user.wast user.cpp && \
eosiocpp -g user.abi user.cpp && \
cleos set contract $EOS_USERNAME . user.wast user.abi
