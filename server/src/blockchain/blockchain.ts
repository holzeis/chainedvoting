'use strict';

import * as Client from 'fabric-client';
import * as CopService from 'fabric-ca-client/lib/FabricCAClientImpl';
import * as Member from 'fabric-client/lib/User';
import {ChaincodeEnvironmentConfiguration, UserConfig} from './chaincode.env.config';
import {BlockchainClient} from './client/blockchain.client';
import {Channel} from './channel';

export enum DeployPolicy {
  ALWAYS,
  NEVER
}

export class Blockchain {
  protected client: Client;
  private caClient: CopService;
  private channels: any[];

  public constructor(protected serverDirectory: string,
                     protected config: ChaincodeEnvironmentConfiguration) {
    this.client = new Client();
  }

  public async init(deployPolicy: DeployPolicy): Promise<void> {
    await this.setKeyStore();
    await this.setCertificateAuthority();
    await this.registerAdminUser();
    await this.registerAndEnrollUsers();
    await this.setupChannels(deployPolicy);
  }

  private async setKeyStore(): Promise<void> {
    console.log('Setting keystore at', this.config.chaincode.keyValStorePath);
    let store = await Client.newDefaultKeyValueStore({
      path: this.config.chaincode.keyValStorePath
    });
    this.client.setStateStore(store);
  }

  private async setCertificateAuthority(): Promise<void> {
    console.log('Adding CA service at', this.config.network.ca.ca.url);

    var	tlsOptions = {
      trustedRoots: [],
      verify: false
    };
    this.caClient = new CopService(this.config.network.ca.ca.url, tlsOptions, this.config.network.ca.ca.name);
  }

  private async setupChannels(deployPolicy: DeployPolicy): Promise<void> {
    this.channels = [];
    for (let i = 0; i < this.config.channels.length; i++) {
      let channel = new Channel(this.client, this.config.channels[i], this.config);
      this.channels.push(channel);
      await channel.initChannel(deployPolicy);
    }
  }

  public async createClient(): Promise<BlockchainClient> {
    return new BlockchainClient(this.channels, this.config);
  }

  private async registerAdminUser(): Promise<void> {
    let adminUser = this.getAdminUserFromConfig();

    return this.client.getUserContext(adminUser.enrollmentID, true)
      .then((user) => {
        return new Promise((resolve, reject) => {
          if (user && user.isEnrolled()) {
            console.log('Successfully loaded member from persistence');
            return resolve(user);
          }

          // need to enroll it with CA server
          let member;
          return this.caClient.enroll({
            enrollmentID: adminUser.enrollmentID,
            enrollmentSecret: adminUser.enrollmentSecret
          }).then((enrollment) => {
            console.log('Successfully enrolled user ' + adminUser.enrollmentID);
            member = new Member(adminUser.enrollmentID, this.client);
            return member.setEnrollment(enrollment.key, enrollment.certificate, this.config.network.organization.mspid);
          }).then(() => {
            return this.client.setUserContext(member);
          }).then(() => {
            return resolve(member);
          }).catch((err) => {
            console.error('Failed to enroll and persist user. Error: ' + err.stack ? err.stack : err);
          });
        });
      });
  }

  private getAdminUserFromConfig(): UserConfig {
    for (let i = 0; i < this.config.network.users.length; i++) {
      if (this.config.network.users[i].enrollmentID === 'admin') {
        return this.config.network.users[i];
      }
    }
  }

  private async registerAndEnrollUsers(): Promise<any> {
    console.log('[SDK] Going to register users');
    let users = this.config.network.appUsers;

    let registerAndEnrollUserPromises: Promise<void>[] = [];
    users.forEach((userToRegisterAndEnroll: any) => {
      registerAndEnrollUserPromises.push(this.registerAndEnrollUser(userToRegisterAndEnroll));
    });

    await Promise.all(registerAndEnrollUserPromises);
  }

  private async registerAndEnrollUser(user: UserConfig): Promise<void> {
   console.log('going to register and enroll', user.enrollmentID);
    let adminUser = await this.setAndGetAdminUser();

    let registeredUser = await this.client.loadUserFromStateStore(user.enrollmentID);

    if (registeredUser) {
      console.log('Already registered', user.enrollmentID);
    } else {
      let registerRequest = {
        enrollmentID: user.enrollmentID,
        role: user.role,
        affiliation: user.affiliation,
        maxEnrollments: 1,
        attrs: user.attributes
      };

      let enrollSecret = await this.caClient.register(registerRequest, adminUser);

      let enrollRequest = {
        enrollmentID: user.enrollmentID,
        enrollmentSecret: enrollSecret
      };

      let enrollment = await this.caClient.enroll(enrollRequest);
      let member = new Member(user.enrollmentID, this.client);
      await member.setEnrollment(enrollment.key, enrollment.certificate, this.config.network.organization.mspid);
      await this.client.setUserContext(member);

      console.log('Successfully registered', user.enrollmentID);
    }
  }

  private async setAndGetAdminUser(): Promise<Member> {
    let adminUserName = this.getAdminUserFromConfig().enrollmentID;
    let adminUser = await this.client.loadUserFromStateStore(adminUserName);
    if (!adminUser) {
      throw new Error('Unable to find admin user');
    }
    await this.client.setUserContext(adminUser);

    return adminUser;
  }
}