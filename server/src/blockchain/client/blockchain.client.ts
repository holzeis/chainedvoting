'use strict';

import {ChaincodeEnvironmentConfiguration} from '../chaincode.env.config';
import {ChaincodeLocalConfig} from '../chaincode.local.config';

export class BlockchainClient {

  public constructor(private channels: any[],
                     private config: ChaincodeEnvironmentConfiguration,
                     ) {
  }

  public async invoke(channelName: string, chaincodeFunctionName: string, args: string[], blockchainUsername: string): Promise<any> {
    let channel = this.getChannel(channelName);

    if (!channel) {
      console.log('Can\'t find channel');
      return 'Can\'t find channel';
    }

    return await channel.invoke(this.config.chaincode.chaincodeID, this.config.chaincode.chaincodeVersion, chaincodeFunctionName, args, blockchainUsername);
  }

  public async query(channelName: string, chaincodeFunctionName: string, args: string[], blockchainUsername: string): Promise<any> {
    let channel = this.getChannel(channelName);

    if (!channel) {
      console.log('Can\'t find channel');
      return 'Can\'t find channel';
    }

    return await channel.query(this.config.chaincode.chaincodeID, this.config.chaincode.chaincodeVersion, chaincodeFunctionName, args, blockchainUsername);
  }

  public async registerEvent(channelName: string, eventName: string, callback: (result: any) => void): Promise<any> {
    let channel = this.getChannel(channelName);

    if (!channel) {
      console.log('Can\'t find channel');
      return 'Can\'t find channel';
    }

    return channel.registerChaincodeEvent(this.config.chaincode.chaincodeID, eventName, callback);
  }

  private getChannel(channelName: string): any {
    let channel: any;
    this.channels.forEach((currentChannel) => {
      if (channelName === currentChannel.getChannelName()) {
        channel = currentChannel;
      }
    });
    return channel;
  }
}