rm -rf ./blockchain/crypto-config
$CRYPTOGEN generate --config=./crypto-config.yaml
mv ./crypto-config ./blockchain/
$CONFIGTXGEN -profile OrdererGenesis -outputBlock ./blockchain/channel-artifacts/genesis.block
$CONFIGTXGEN -profile Channel -outputCreateChannelTx ./blockchain/channel-artifacts/channel.tx -channelID channel
$CONFIGTXGEN -profile Channel -outputAnchorPeersUpdate ./blockchain/channel-artifacts/OrgMSPanchors.tx -channelID channel -asOrg OrgMSP
