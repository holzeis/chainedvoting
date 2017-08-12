"use strict";

export interface ChaincodeEnvironmentConfiguration {
  network: {
    peers: PeerConfig[],
    ca: {
      ca: {
        url: string,
        name: string
      }
    },
    orderer: OrdererConfig
    organization: {
      name: string,
      mspid: string
    }
    users: UserConfig[],
    appUsers: UserConfig[],
    cert?: string,
    cert_path?: string
  };
  chaincode: {
    keyValStorePath: string,
    chaincodeID: string,
    chaincodePath: string,
    chaincodeVersion: string,
    certPath?: string,
    certPath2?: string
  };
  channels: ChannelConfig[];
}

export interface UserConfig {
  enrollmentID: string;
  enrollmentSecret?: string;
  role?: string;
  affiliation?: string;
  attributes?: UserAttribute[];
}

export interface PeerConfig {
  requests: string;
  events: string;
  server_hostname: string;
  tls_cacerts: string;
}

export interface OrdererConfig {
  url: string;
  server_hostname: string;
  tls_cacerts: string;
}

export interface UserAttribute {
  name: string;
  value: string;
}

export interface ChannelConfig {
  name: string;
  path: string;
}
