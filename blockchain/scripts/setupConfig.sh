rm -rf ./../crypto-config
$CRYPTOGEN generate --config=./../config/crypto-config.yaml
mv ./crypto-config ./../
$CONFIGTXGEN -profile OrdererGenesis -channelID channel -outputBlock channel.block -inspectBlock channel.block
mv channel.block ./../channel-artifacts/
$CONFIGTXGEN -profile Channel -outputCreateChannelTx channel.tx -channelID channel
mv channel.tx ./../channel-artifacts/
$CONFIGTXGEN -profile Channel -outputAnchorPeersUpdate Org1MSPanchors.tx -channelID channel -asOrg Org1MSP
mv Org1MSPanchors.tx ./../channel-artifacts/
