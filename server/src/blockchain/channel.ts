"use strict";

import * as fs from "fs";
import * as path from "path";
import * as grpc from "grpc";
import * as Client from "fabric-client";
import * as Orderer from "fabric-client/lib/Orderer";
import * as Peer from "fabric-client/lib/Peer";
import * as EventHub from "fabric-client/lib/EventHub";
import * as hfcUtil from "fabric-client/lib/utils.js";
import * as Member from "fabric-client/lib/User";
import {ChaincodeEnvironmentConfiguration, ChannelConfig} from "./chaincode.env.config";

import { Transaction } from "../models/transaction";

export enum DeployPolicy {
  ALWAYS,
  NEVER
}

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
    this._commonProto = grpc.load(path.join(__dirname, "../../node_modules/fabric-client/lib/protos/common/common.proto")).common;
    this._configtxProto = grpc.load(path.join(__dirname, "../../node_modules/fabric-client/lib/protos/common/configtx.proto")).common;
  }

  public async initChannel(): Promise<void> {

    this.channel = await this.client.newChannel(this.channelConfig.name);

    await this.createOrgAdminUser();
    await this.addOrderer();
    await this.addEventHubsAndPeers();


    let deployPolicy : DeployPolicy;
    deployPolicy = await this.determineDeployPolicy();

    switch (deployPolicy) {
      case DeployPolicy.ALWAYS:
        console.log("creating channel.");
        await this.createChannel();
        console.log("joining channel.");
        await this.joinChannel();
        console.log("installing chaincode.");
        await this.installChaincode(this.config.chaincode.chaincodePath,
                  this.config.chaincode.chaincodeID, this.config.chaincode.chaincodeVersion);
        console.log("initializing channel.");
        await this.channel.initialize();
        console.log("instantiating chaincode.");
        await this.instantiateChaincode(this.config.chaincode.chaincodePath,
                  this.config.chaincode.chaincodeID, this.config.chaincode.chaincodeVersion, []);
        break;
      case DeployPolicy.NEVER:
        console.log("initializing channel.");
        await this.channel.initialize();
        break;
    }
  }

  private async determineDeployPolicy(): Promise<DeployPolicy> {
     let blockRequest = {
      txId : 	this.client.newTransactionID()
    };

    return this.channel.getGenesisBlock(blockRequest).then(genesisBlock => {
      console.log("Found genesis block.");
      return DeployPolicy.NEVER;
    }, (err) => {
      console.log("Could not find genesis block. Going to create channel!");
      return DeployPolicy.ALWAYS;
    });
  }

  private async createOrgAdminUser(): Promise<void> {
    console.log("Going to set the org admin user");

    let keyPath = path.join(__dirname, "../../resources/crypto-config/peerOrganizations/" +
                        "org.chained-voting.com/users/Admin@org.chained-voting.com/msp/keystore");
    let keyPEM = Buffer.from(this.readAllFiles(keyPath)[0]).toString();
    let certPath = path.join(__dirname, "../../resources/crypto-config/peerOrganizations/" +
                        "org.chained-voting.com/users/Admin@org.chained-voting.com/msp/signcerts");
    let certPEM = this.readAllFiles(certPath)[0];

    this.orgAdminUser = await this.client.createUser({
      username: "Admin",
      mspid: "OrgMSP",
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
    console.log("Adding orderer");
    let caRootsPath = this.config.network.orderer.tls_cacerts;

    let data = await fs.readFileSync(path.join(__dirname, caRootsPath));
    let caroots = Buffer.from(data).toString();
    let hostname = this.config.network.orderer.server_hostname;

    this.orderer = await this.client.newOrderer(
      this.config.network.orderer.url,
      {
        "pem": caroots,
        "ssl-target-name-override": hostname
      }
    );
    await this.channel.addOrderer(this.orderer);
  }

  private async addEventHubsAndPeers(): Promise<void> {
    console.log("Adding eventHubs and Peers");
    this.eventHubs = [];
    let peersConfig = this.config.network.peers;

    return new Promise<any>((resolve: () => void, reject: (error: Error) => void) => {
      for (let key in peersConfig) {
        if (key) {

          let data = fs.readFileSync(path.join(__dirname, peersConfig[key].tls_cacerts));
          let tlscerts = Buffer.from(data).toString();
          let hostname = peersConfig[key].server_hostname;

          this.channel.addPeer(new Peer(
            peersConfig[key].requests,
            {
              pem: tlscerts,
              "ssl-target-name-override": hostname
            }

          ));

          let eh = new EventHub(this.client);

          eh.setPeerAddr(
            peersConfig[key].events,
            {
              pem: tlscerts,
              "ssl-target-name-override": hostname
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
    let data = await fs.readFileSync(path.join(__dirname, "../../resources", this.channelConfig.path));

    let envelope = this._commonProto.Envelope.decode(data);
    let payload = this._commonProto.Payload.decode(envelope.getPayload().toBuffer());
    let configtx = this._configtxProto.ConfigUpdateEnvelope.decode(payload.getData().toBuffer());
    let config = configtx.getConfigUpdate().toBuffer();
    let signatures = [];

    signatures.push(this.client.signChannelConfig(config));

    let txId = this.client.newTransactionID();

    let request = {
      name: this.channelConfig.name,
      orderer: this.orderer,
      config: config,
      signatures: signatures,
      txId: txId
    };

    return this.client.createChannel(request)
      .then((response) => {
        if (response && response.status === "SUCCESS") {
          console.log("Successfully created the channel.");
          return this.sleep(5000);
        } else {
          console.error("Failed to create the channel. ");
        }
      }, (err) => {
        console.error("Failed to initialize the channel: " + err.stack ? err.stack : err);
      })
      .then(() => {
        console.log("Successfully waited to make sure new channel was created.");
      }, (err) => {
        console.error("Failed to sleep due to error: " + err.stack ? err.stack : err);
      });
  }

  private async sleep(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async setAndGetUserContext(userName: string): Promise<Member> {
    let user = await this.client.loadUserFromStateStore(userName);
    if (!user) {
      throw new Error("Unable to find user " + userName);
    }
    await this.client.setUserContext(user);

    return user;
  }

  private async joinChannel(): Promise<void> {
    console.log("Joining channel", this.channelConfig.name);

    let txId = this.client.newTransactionID();

    let getBlockRequest = {
      txId : 	txId
    };

    let genesisBlock = await this.channel.getGenesisBlock(getBlockRequest);

    txId = this.client.newTransactionID();

    let joinChannelRequest = {
      targets: this.channel.getPeers(),
      block : genesisBlock,
      txId: txId
    };

    let sendPromise = this.channel.joinChannel(joinChannelRequest);
    return Promise.all([sendPromise])
      .then((results) => {
        if (results[0] && results[0][0] && results[0][0].response && results[0][0].response.status === 200) {
          console.log("All peers successfully joined the channel");
        } else {
          console.error(" Failed to join channel");
          throw new Error("Failed to join channel");
        }
      }, (err) => {
        console.error("Failed to join channel due to error: " + err.stack ? err.stack : err);
      });
  }

  private async installChaincode(chaincodePath: string, chaincodeId: string, chaincodeVersion: string): Promise<void> {
    console.log("Going to install chaincode");

    let txId = this.client.newTransactionID();

    let request = {
      targets: this.channel.getPeers(),
      chaincodePath: chaincodePath,
      chaincodeId: chaincodeId,
      chaincodeVersion: chaincodeVersion,
      txId: txId
    };

    const installResponse = await this.client.installChaincode(request);
    this.processProposal(installResponse, "install");
    console.log("Install chaincode done");
  }

  private async instantiateChaincode(chaincodePath: string, chaincodeId: string, chaincodeVersion: string, args: string[]): Promise<void> {

    console.log("Going to instantiate chaincode");

    let txId = this.client.newTransactionID();

    let request = {
      chaincodeId: chaincodeId,
      chaincodeVersion: chaincodeVersion,
      txId: txId,
      fcn: "init",
      args: args
    };

    let proposalResponse = await this.channel.sendInstantiateProposal(request);

    let signedRequest = this.processProposal(proposalResponse, "instantiate");

    let eventPromises = [];
    this.eventHubs.forEach((eh) => {
      eventPromises.push(this.setTxEvent(eh, txId.getTransactionID()));
    });

    let sendPromise = await this.channel.sendTransaction(signedRequest);

    return Promise.all([sendPromise].concat(eventPromises))
      .then((results) => {
        console.log("Successfully instantiated the chaincode");
        return results[0];
      }).catch((err) => {
        console.error("Error: " + err);
        console.error("Failed to send instantiate transaction and get notifications within the timeout period.");
        throw new Error("Failed to send instantiate transaction and get notifications within the timeout period.");
      });

  }

  private processProposal(proposalResponse: any, proposalType: string): any {

    let proposalResponses = proposalResponse[0];
    let proposal = proposalResponse[1];

    let allGood = true;
    for (let response of proposalResponses) {
      let oneGood = false;
      if (proposalResponses && response.response && response.response.status === 200) {
        oneGood = true;
        console.log("proposal was good");
      } else {
        console.log("proposal was bad");
      }
      allGood = allGood && oneGood;
    }

    if (allGood) {
      if (proposalType === "instantiate") {
        return {
          proposalResponses: proposalResponses,
          proposal: proposal
        };
      } else {
        return {};
      }
    } else {
      console.error("Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...");
    }
}

  public async query(chaincodeID: string, chaincodeVersion: string, chaincodeFunctionName: string,
          args: string[], userName: string): Promise<any> {
    console.log("Querying " + this.channelConfig.name + " with function name " + chaincodeFunctionName);

    args.unshift(chaincodeFunctionName);

    let request = {
      chaincodeId: chaincodeID,
      chaincodeVersion: chaincodeVersion,
      fcn: "invoke",
      args: args,
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
      let responseAsString = response.toString("utf8");
      let responseAsObject = {};
      formattedQueryResponse.rawPeerPayloads.push(responseAsString);

      if (previousResponse != null) {
        if (previousResponse !== responseAsString) {
          console.warn("Warning - some peers do not agree on query", previousResponse, responseAsString);
          formattedQueryResponse.peersAgree = false;
        }
        previousResponse = responseAsString;
      } else {
        previousResponse = responseAsString;
      }

      try {
        if (responseAsString !== "") {
          responseAsObject = JSON.parse(responseAsString);
        }
        if (formattedQueryResponse.parsed === null) {
          formattedQueryResponse.parsed = responseAsObject;
        }
      } catch (e) {
        if (responseAsString.indexOf("Error: failed to obtain") >= 0) {
          console.error("Query response looks like an error", typeof responseAsString, responseAsString);
          formattedQueryResponse.parsed = null;
        } else {
          console.warn("Query response is not json, might be okay.", typeof responseAsString, responseAsString);
          formattedQueryResponse.parsed = responseAsString;
        }
      }
    });

    return formattedQueryResponse;
  }

  public async invoke(chaincodeID: string, chaincodeVersion: string, chaincodeFunctionName: string,
            args: string[], userName: string): Promise<InvokeReponse> {
    console.log("Invoking " + this.channelConfig.name + " with function name " + chaincodeFunctionName);
    let txId = this.client.newTransactionID();

    args.unshift(chaincodeFunctionName);

    let request = {
      chaincodeId: chaincodeID,
      chaincodeVersion: chaincodeVersion,
      txId: txId,
      fcn: "invoke",
      args: args
    };

    let proposalResponse = await this.channel.sendTransactionProposal(request);
    if (!proposalResponse || !proposalResponse[0] || !proposalResponse[0][0]) {
      return Promise.reject(new Error("Error during endorsment!"));
    }
    if (!proposalResponse || !proposalResponse[0] || !proposalResponse[0][0] ||
            !proposalResponse[0][0].response || proposalResponse[0][0].response.status !== 200) {
      const errmsg = proposalResponse[0][0].message;
		  return Promise.reject(new Error(errmsg.substring(errmsg.lastIndexOf(":") + 2, errmsg.lastIndexOf(")"))));
    }

    let finalResult;
    if (proposalResponse[0][0].response.payload.length > 0) {
      let formatted_response = JSON.parse(proposalResponse[0][0].response.payload);
      if (formatted_response != null) {
        finalResult = formatted_response;
      }
    }

    let processedProposal: ProcessInvokeProposalResponse = this.processInvokeProposal(proposalResponse);

    if (processedProposal.success) {
      let eventPromises = [];
      this.eventHubs.forEach((eh) => {
        eventPromises.push(this.setTxEvent(eh, txId.getTransactionID()));
      });

      let sendPromise = await this.channel.sendTransaction(processedProposal.successResponse);
      return Promise.all([sendPromise].concat(eventPromises))
        .then((results) => {
          console.log("Invoke completed");
          return {
            success: true,
            payload: finalResult
          };
        }).catch((err) => {
          console.error("Failed to get all notifications within the timeout period.");
          return {
            success: false,
            message: "Failed to get all notifications within the timeout period."
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
          console.warn("Warning - peer return different errors", previousErrorMessage, errorMessage);
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
      return errorMessages.join(",");
    }
  }

  private async setTxEvent(eh: EventHub, txId: string): Promise<void> {
    return new Promise<void>((resolve: () => void, reject: () => void) => {
      let handle = setTimeout(reject, 30000);

       eh.registerTxEvent(txId, (tx, code) => {
        console.log("The transaction has been committed on peer ");
        clearTimeout(handle);
        eh.unregisterTxEvent(txId);

        if (code !== "VALID") {
          console.error("The transaction was invalid, code = " + code);
          reject();
        } else {
          console.log("The transaction was valid.");
          resolve();
        }
      });
    });
  }

  public async registerChaincodeEvent(chaincodeID: string, eventName: string, callback: (result: any) => void): Promise<void> {
    await this.eventHubs[0].registerChaincodeEvent(chaincodeID, eventName, callback);
  }

  public async queryBlocks(): Promise<Transaction[]> {
    let info = await this.channel.queryInfo();
    let transactions : Transaction[] = [];
    for (let i = (info.height.low - 40) > 0 ? (info.height.low - 40) : 0; i < info.height.low; i++) {
      let blockinfo = await this.channel.queryBlock(i);

      console.log(i + ". " + blockinfo.header.data_hash);
      for (let x = 0; x < blockinfo.data.data.length; x++) {
        let header = blockinfo.data.data[x].payload.header.channel_header;
        const transaction = new Transaction(i, blockinfo.header.data_hash, header);
        console.log(header.tx_id);
        transactions.push(transaction);
      }
    }
    return transactions;
  }

}

export interface InvokeReponse {
  success: boolean;
  message?: string;
  payload?: any;
}

interface ProcessInvokeProposalResponse {
  success: boolean;
  successResponse?: any;
  errorResponse?: string;
}
