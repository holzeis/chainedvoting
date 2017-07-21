import { InMemoryDbService } from 'angular-in-memory-web-api';
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const polls = [
      {
        id: 1,
        name: 'Class president',
        description: 'Class president poll of 2017',
        owner: 1,
        validFrom: null,
        validTo: null,
        options: [
          'Tom', 'Jerry'
        ]
      },
      {
        id: 2,
        name: 'Class vice president',
        description: 'Class vice president poll of 2017',
        owner: 2,
        validFrom: null,
        validTo: null,
        options: [
          'Jane', 'John'
        ]
      }
    ];

    const votes =
    [
      {
      id: 1,
      pollID: 1,
      voter: 1,
      description: '',
      option: null,
      delegate: null,
      timestamp: null
    },
    {
      id: 2,
      pollID: 1,
      voter: 2,
      option: null,
      delegate: 1,
      timestamp: null,
    },
    {
      id: 3,
      pollID: 2,
      voter: 1,
      option: null,
      delegate: null,
      timestamp: null
    }
    ];

    const users = [
      {
        id: 1,
        email: 'ysadek@ibm.com',
      },
      {
        id: 2,
        email: 'max@mustermann.de',
      }
    ];
    return {polls, votes, users};
  }
}
