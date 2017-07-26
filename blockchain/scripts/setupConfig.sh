rm -rf ./../crypto-config
$CRYPTOGEN generate --config=./../config/crypto-config.yaml
mv ./crypto-config ./../
$CONFIGTXGEN -profile OrdererGenesis -channelID default -outputBlock genesis.block
mv genesis.block ./../channel-artifacts/
$CONFIGTXGEN -profile Channel -outputCreateChannelTx channel.tx -channelID default
mv channel.tx ./../channel-artifacts/
$CONFIGTXGEN -profile Channel -outputAnchorPeersUpdate OrgMSPanchors.tx -channelID default -asOrg OrgMSP
mv OrgMSPanchors.tx ./../channel-artifacts/
