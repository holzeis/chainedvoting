import { ChaincodeEnvironmentConfiguration, UserConfig, PeerConfig, OrdererConfig, ChannelConfig } from './chaincode.env.config';

export class ChaincodeLocalConfig {
  public getConfiguration(): ChaincodeEnvironmentConfiguration {
    const organization = 'Org';

    return {
      network:   {
        peers: <PeerConfig[]>[
          {
            requests: 'grpcs://peer0.org.chained-voting.com:7051',
            events: 'grpcs://peer0.org.chained-voting.com:7053',
            server_hostname: 'peer0.org.chained-voting.com',
            tls_cacerts: '../../resources/crypto-config/peerOrganizations/org.chained-voting.com/peers/peer0.org.chained-voting.com/msp/cacerts/ca.org.chained-voting.com-cert.pem'
          }
        ],
        ca:    {
          ca: {
            url: 'https://ca0:7054',
            name: 'ca-org'
          }
        },
        orderer: <OrdererConfig>{
          url: 'grpcs://orderer.chained-voting.com:7050',
          server_hostname: 'orderer.chained-voting.com',
          tls_cacerts: '../../resources/crypto-config/ordererOrganizations/chained-voting.com/orderers/orderer.chained-voting.com/msp/cacerts/ca.chained-voting.com-cert.pem'
        },
        organization: {
          name: organization,
          mspid: 'OrgMSP'
        },
        users: <UserConfig[]>[
          {
            enrollmentID:     'admin',
            enrollmentSecret: 'adminpw'
          }
        ],
        appUsers: <UserConfig[]> {}
      },
      chaincode: {
        keyValStorePath: '/tmp/hfc-test-kvs-org',
        chaincodeID: 'chaincode',
        chaincodePath: 'chaincode',
        chaincodeVersion: 'v1'
      },
      channels : <ChannelConfig[]>[
        {
          name: 'default',
          path: '../resources/channel-artifacts/channel.tx'
        }
      ]
    };
  }
}
