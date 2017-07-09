'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as grpc from 'grpc';
import * as Client from 'fabric-client';
import * as Orderer from 'fabric-client/lib/Orderer';
import * as Peer from 'fabric-client/lib/Peer';
import * as EventHub from 'fabric-client/lib/EventHub';
import * as hfcUtil from 'fabric-client/lib/utils.js';
import * as Member from 'fabric-client/lib/User';
import {ChaincodeEnvironmentConfiguration, ChannelConfig} from './chaincode.env.config';
import {DeployPolicy} from './blockchain';

export class Channel {
  private channel: any;
  private eventHubs: EventHub[];
  private orderer: Orderer;
  private _commonProto: any;
  private _configtxProto: any;
  private orgAdminUser: any;

  public constructor(private client: Client,
                     private channelConfig: ChannelConfig,
                     private config: ChaincodeEnvironmentConfiguration) {
    this._commonProto = grpc.load(path.join(__dirname, '../../node_modules/fabric-client/lib/protos/common/common.proto')).common;
    this._configtxProto = grpc.load(path.join(__dirname, '../../node_modules/fabric-client/lib/protos/common/configtx.proto')).common;
  }


  public async initChannel(deployPolicy: DeployPolicy): Promise<void> {
    this.channel = await this.client.newChannel(this.channelConfig.name);
    await this.createOrgAdminUser();
    await this.addOrderer();
    await this.addEventHubsAndPeers();

    switch (deployPolicy) {
      case DeployPolicy.ALWAYS:
        await this.createChannel();
        await this.joinChannel();
        await this.installChaincode(this.config.chaincode.chaincodePath, this.config.chaincode.chaincodeID, this.config.chaincode.chaincodeVersion);
        await this.channel.initialize();
        await this.instantiateChaincode(this.config.chaincode.chaincodePath, this.config.chaincode.chaincodeID, this.config.chaincode.chaincodeVersion, []);
        break;
      case DeployPolicy.NEVER:
        await this.channel.initialize();
        break;
    }
}

private async createOrgAdminUser(): Promise<void> {
  console.info('Going to set the org admin user');

  let keyPath = path.join(__dirname, '../../resources/crypto-config/peerOrganizations/org.chained-voting.com/users/Admin@org.chained-voting.com/msp/keystore');
  let keyPEM = Buffer.from(this.readAllFiles(keyPath)[0]).toString();
  let certPath = path.join(__dirname, '../../resources/crypto-config/peerOrganizations/org.chained-voting.com/users/Admin@org.chained-voting.com/msp/signcerts');
  let certPEM = this.readAllFiles(certPath)[0];

  this.orgAdminUser = await this.client.createUser({
    username: 'peerorgAdmin',
    mspid: 'OrgMSP',
    cryptoContent: {
      privateKeyPEM: keyPEM.toString(),
      signedCertPEM: certPEM.toString()
    }
  });
}

  public getChannelName(): string {
    return this.channelConfig.name;
  }


  private async setOrgAdminAsUserContext(): Promise<void> {
    await this.client.setUserContext(this.orgAdminUser);
}

private async addOrderer(): Promise<void> {
  console.info('Adding orderer');
  let caRootsPath = this.config.network.orderer.tls_cacerts;
  let data = await fs.readFileSync(path.join(__dirname, caRootsPath));
  let caroots = Buffer.from(data).toString();

  this.orderer = await this.client.newOrderer(
    this.config.network.orderer.url,
    {
      'pem': caroots,
      'ssl-target-name-override': this.config.network.orderer.server_hostname
    }
  );
  await this.channel.addOrderer(this.orderer);
}

  private async addEventHubsAndPeers(): Promise<void> {
    console.log('Adding eventHubs and Peers');
    this.eventHubs = [];
    let peersConfig = this.config.network.peers;

    return new Promise<any>((resolve: () => void, reject: (error: Error) => void) => {
      for (let key in peersConfig) {
        if (key) {
          let data = fs.readFileSync(path.join(__dirname, peersConfig[key].tls_cacerts));

          this.channel.addPeer(new Peer(
            peersConfig[key].requests,
            {
              pem: Buffer.from(data).toString(),
              'ssl-target-name-override': peersConfig[key].server_hostname
            }
          ));

          let eh = new EventHub(this.client);
          eh.setPeerAddr(
            peersConfig[key].events,
            {
              pem: Buffer.from(data).toString(),
              'ssl-target-name-override': peersConfig[key].server_hostname
            }
          );
          eh.connect();
          this.eventHubs.push(eh);
        }
      }
      resolve();
    });
  }

  private readAllFiles(dir: any): any {
    let files = fs.readdirSync(dir);
    let certs = [];
    files.forEach((fileName) => {
      let filePath = path.join(dir, fileName);
      let data = fs.readFileSync(filePath);
      certs.push(data);
    });
    return certs;
  }

  private async createChannel(): Promise<void> {

    let data = await fs.readFileSync(path.join(__dirname, '../../resources', this.channelConfig.path));

    let envelope = this._commonProto.Envelope.decode(data);
    let payload = this._commonProto.Payload.decode(envelope.getPayload().toBuffer());
    let configtx = this._configtxProto.ConfigUpdateEnvelope.decode(payload.getData().toBuffer());
    let config = configtx.getConfigUpdate().toBuffer();
    let signatures = [];

    signatures.push(this.client.signChannelConfig(config));

    let nonce = hfcUtil.getNonce();
    let txId = this.client.newTransactionID(nonce, this.orgAdminUser)

    let request = {
      name: this.channelConfig.name,
      orderer: this.orderer,
      config: config,
      nonce: nonce,
      txId: txId,
      signatures: signatures
    };

    return this.client.createChannel(request)
      .then((response) => {
        if (response && response.status === 'SUCCESS') {
          console.log('Successfully created the channel.');
          return this.sleep(5000);
        } else {
          console.error('Failed to create the channel. ');
        }
      }, (err) => {
        console.error('Failed to initialize the channel: ' + err.stack ? err.stack : err);
      })
      .then(() => {
        console.log('Successfully waited to make sure new channel was created.');
      }, (err) => {
        console.error('Failed to sleep due to error: ' + err.stack ? err.stack : err);
      });
  }

  private async sleep(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async setAndGetUserContext(userName: string): Promise<Member> {
    let user = await this.client.loadUserFromStateStore(userName);
    if (!user) {
      throw new Error('Unable to find user ' + userName);
    }
    await this.client.setUserContext(user);

    return user;
  }

  private async joinChannel(): Promise<void> {
    console.info('Joining channel', this.channelConfig.name);

    let nonce = hfcUtil.getNonce();
    let txId = this.client.newTransactionID(nonce, this.orgAdminUser);

    let getBlockRequest = {
      txId : 	txId,
      nonce : nonce
    };

    let genesisBlock = await this.channel.getGenesisBlock(getBlockRequest);

    nonce = hfcUtil.getNonce();
    txId = this.client.newTransactionID(nonce, this.orgAdminUser);

    let joinChannelRequest = {
      targets: this.channel.getPeers(),
      block : genesisBlock,
      txId: txId,
      nonce: nonce
    };

    let sendPromise = this.channel.joinChannel(joinChannelRequest);
    return Promise.all([sendPromise])
      .then((results) => {
        if (results[0] && results[0][0] && results[0][0].response && results[0][0].response.status === 200) {
          console.info('All peers successfully joined the channel');
        } else {
          console.error(' Failed to join channel');
          throw new Error('Failed to join channel');
        }
      }, (err) => {
        console.error('Failed to join channel due to error: ' + err.stack ? err.stack : err);
      });
  }

  private async installChaincode(chaincodePath: string, chaincodeId: string, chaincodeVersion: string): Promise<void> {
    console.info('Going to install chaincode');

    let nonce = hfcUtil.getNonce();
    let txId = this.client.newTransactionID(nonce, this.orgAdminUser);
    console.info('Affected peers:');
    console.dir(this.channel.getPeers());
    let request = {
      targets: this.channel.getPeers(),
      chaincodePath: chaincodePath,
      chaincodeId: chaincodeId,
      chaincodeVersion: chaincodeVersion,
      txId: txId,
      nonce: nonce
    };

    const installResponse = await this.client.installChaincode(request);
    this.processProposal(installResponse, 'install');
    console.info('Install chaincode done');
  }

  private async instantiateChaincode(chaincodePath: string, chaincodeId: string, chaincodeVersion: string, args: string[]): Promise<void> {
    console.info('Going to instantiate chaincode');

    let nonce = hfcUtil.getNonce();
    let txId = this.client.newTransactionID(nonce, this.orgAdminUser);

    let request = {
      chaincodePath: chaincodePath,
      chaincodeId: chaincodeId,
      chaincodeVersion: chaincodeVersion,
      fcn: 'init',
      args: args,
      chainId: this.channelConfig.name,
      txId: txId,
      nonce: nonce
      // use this to demonstrate the following policy:
      // 'if signed by org1 admin, then that's the only signature required,
      // but if that signature is missing, then the policy can also be fulfilled
      // when members (non-admin) from both orgs signed'
      // 'endorsement-policy': {
      //   identities: [
      //     { role: { name: 'member', mspId: 'Org1MSP' }},
      //     { role: { name: 'admin', mspId: 'Org1MSP' }}
      //   ],
      //   policy: {
      //     '1-of': [
      //       { 'signed-by': 1},
      //       { '2-of': [{ 'signed-by': 0}, { 'signed-by': 1 }]}
      //     ]
      //   }
      // }
    };
    console.info('Log the request:');
    console.dir(request);
    let proposalResponse = await this.channel.sendInstantiateProposal(request);
    console.info('Log the proposalResponse:');
    console.dir(proposalResponse);
    let signedRequest = this.processProposal(proposalResponse, 'instantiate');
    console.info('Log the signedRequest:');
    console.dir(signedRequest);

    let eventPromises = [];
    this.eventHubs.forEach((eh) => {
      eventPromises.push(this.setTxEvent(eh, txId.toString()));
    });

    let sendPromise = await this.channel.sendTransaction(signedRequest);
    console.info('Log the sendPromise:');
    console.dir(sendPromise);

    console.info('Log the eventPromises:');
    console.dir(eventPromises);
    return Promise.all([sendPromise].concat(eventPromises))
      .then((results) => {
        console.info('Successfully instantiated the chaincode');
        return results[0];
      }).catch((err) => {
        console.error('Failed to send instantiate transaction and get notifications within the timeout period.');
        throw new Error('Failed to send instantiate transaction and get notifications within the timeout period.');
      });
  }

  private processProposal(proposalResponse: any, proposalType: string): any {
    let proposalResponses = proposalResponse[0];
    let proposal = proposalResponse[1];
    let header = proposalResponse[2];

    let allGood = true;
    for (let response of proposalResponses) {
      let oneGood = false;
      if (proposalResponses && response.response && response.response.status === 200) {
        oneGood = true;
        console.info('proposal was good');
      } else {
        console.info('proposal was bad');
      }
      allGood = allGood && oneGood;
    }

    if (allGood) {
      if (proposalType === 'instantiate') {
        return {
          proposalResponses: proposalResponses,
          proposal: proposal,
          header: header
        };
      } else {
        return {};
      }
    } else {
      console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
    }
}

  public async query(chaincodeID: string, chaincodeVersion: string, chaincodeFunctionName: string, args: string[], userName: string): Promise<any> {
    console.info('Querying ' + this.channelConfig.name + ' with function name ' + chaincodeFunctionName);
    let nonce = hfcUtil.getNonce();
    let txId = this.client.newTransactionID(nonce, await this.setAndGetUserContext(userName));

    args.unshift(chaincodeFunctionName);

    let request = {
      chaincodeId: chaincodeID,
      chaincodeVersion: chaincodeVersion,
      fcn: 'invoke',
      args: args,
      chainId: this.channelConfig.name,
      txId: txId,
      nonce: nonce
    };

    let queryResponse = await this.channel.queryByChaincode(request);
    let formattedResponse = this.formatQueryResponse(queryResponse);

    return formattedResponse.parsed;
  }

  private formatQueryResponse(queryResponses: any): any {
    let formattedQueryResponse = {
      parsed: null,
      peersAgree: true,
      rawPeerPayloads: [],
    };
    let previousResponse = null;

    queryResponses.forEach((response) => {
      let responseAsString = response.toString('utf8');
      let responseAsObject = {};
      formattedQueryResponse.rawPeerPayloads.push(responseAsString);

      if (previousResponse != null) {
        if (previousResponse !== responseAsString) {
          console.warn('Warning - some peers do not agree on query', previousResponse, responseAsString);
          formattedQueryResponse.peersAgree = false;
        }
        previousResponse = responseAsString;
      } else {
        previousResponse = responseAsString;
      }

      try {
        if (responseAsString !== '') {
          responseAsObject = JSON.parse(responseAsString);
        }
        if (formattedQueryResponse.parsed === null) {
          formattedQueryResponse.parsed = responseAsObject;
        }
      } catch (e) {
        if (responseAsString.indexOf('Error: failed to obtain') >= 0) {
          console.error('Query response looks like an error', typeof responseAsString, responseAsString);
          formattedQueryResponse.parsed = null;
        } else {
          console.warn('Query response is not json, might be okay.', typeof responseAsString, responseAsString);
          formattedQueryResponse.parsed = responseAsString;
        }
      }
    });

    return formattedQueryResponse;
  }

  public async invoke(chaincodeID: string, chaincodeVersion: string, chaincodeFunctionName: string, args: string[], userName: string): Promise<InvokeReponse> {
    console.info('Invoking ' + this.channelConfig.name + ' with function name ' + chaincodeFunctionName);
    let nonce = hfcUtil.getNonce();
    let txId = this.client.newTransactionID(nonce, await this.setAndGetUserContext(userName));

    args.unshift(chaincodeFunctionName);

    let request = {
      chaincodeId: chaincodeID,
      chaincodeVersion: chaincodeVersion,
      fcn: 'invoke',
      args: args,
      chainId: this.channelConfig.name,
      txId: txId,
      nonce: nonce
    };

    let proposalResponse = await this.channel.sendTransactionProposal(request);
    let processedProposal: ProcessInvokeProposalResponse = this.processInvokeProposal(proposalResponse);

    if (processedProposal.success) {
      let eventPromises = [];
      this.eventHubs.forEach((eh) => {
        eventPromises.push(this.setTxEvent(eh, txId.toString()));
      });

      let sendPromise = await this.channel.sendTransaction(processedProposal.successResponse);
      return Promise.all([sendPromise].concat(eventPromises))
        .then((results) => {
          console.info('Invoke completed');
          return {
            success: true
          };
        }).catch((err) => {
          console.error('Failed to get all notifications within the timeout period.');
          return {
            success: false,
            message: 'Failed to get all notifications within the timeout period.'
          };
        });
    } else {
      return {
        success: false,
        message: processedProposal.errorResponse
      };
    }
  }

  private processInvokeProposal(proposalResponse: any): ProcessInvokeProposalResponse {
    let proposalResponses = proposalResponse[0];
    let proposal = proposalResponse[1];
    let header = proposalResponse[2];

    let allProposalsAreSuccess = true;
    let errorResponses: string[] = [];

    for (let response of proposalResponses) {
      let currentProposalIsSuccess = this.channel.verifyProposalResponse(response);
      if (!currentProposalIsSuccess) {
        errorResponses.push(response.toString());
      }
      allProposalsAreSuccess = allProposalsAreSuccess && currentProposalIsSuccess;
    }
    allProposalsAreSuccess = this.channel.compareProposalResponseResults(proposalResponses);

    let processInvokeProposalResponse: ProcessInvokeProposalResponse = {success: allProposalsAreSuccess};
    if (processInvokeProposalResponse.success) {
      processInvokeProposalResponse.successResponse = {
        proposalResponses: proposalResponses,
        proposal: proposal,
        header: header
      };
    } else {
      processInvokeProposalResponse.errorResponse = this.getErrorMessage(errorResponses);
    }

    return processInvokeProposalResponse;
  }

  private getErrorMessage(errorMessages: string[]): string {
    let previousErrorMessage = null;
    let errorMessageAreEqual = true;

    errorMessages.forEach(errorMessage => {
      if (previousErrorMessage != null) {
        if (previousErrorMessage !== errorMessage) {
          console.warn('Warning - peer return different errors', previousErrorMessage, errorMessage);
          errorMessageAreEqual = false;
        }
        previousErrorMessage = errorMessage;
      } else {
        previousErrorMessage = errorMessage;
      }
    });

    if (errorMessageAreEqual) {
      return errorMessages[0];
    } else {
      return errorMessages.join(',');
    }
  }

  private async setTxEvent(eh: EventHub, txId: string): Promise<void> {
    return new Promise<void>((resolve: () => void, reject: () => void) => {
      let handle = setTimeout(reject, 30000);

      eh.registerTxEvent(txId.toString(), (tx, code) => {
        console.info('The transaction has been committed on peer ' + eh.ep._endpoint.addr);
        clearTimeout(handle);
        eh.unregisterTxEvent(txId);

        if (code !== 'VALID') {
          console.error('The transaction was invalid, code = ' + code);
          reject();
        } else {
          console.info('The transaction was valid.');
          resolve();
        }
      });
    });
  }

  public async registerChaincodeEvent(chaincodeID: string, eventName: string, callback: (result: any) => void): Promise<void> {
    await this.eventHubs[0].registerChaincodeEvent(chaincodeID, eventName, callback);
  }
}

export interface InvokeReponse {
  success: boolean;
  message?: string;
}

interface ProcessInvokeProposalResponse {
  success: boolean;
  successResponse?: any;
  errorResponse?: string;
}
