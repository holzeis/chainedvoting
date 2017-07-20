import { InMemoryDbService } from 'angular-in-memory-web-api';
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const polls = [
      {
        id: 1234,
        name: 'Class president',
        description: 'Class president poll of 2017',
        owner: 1,
        validFrom: 'tba',
        validTo: '',
        options: [
          'Tom', 'Jerry'
        ]
      },
      {
        id: 1235,
        name: 'Class vice president',
        description: 'Class vice president poll of 2017',
        owner: null,
        validFrom: 'tba',
        validTo: '',
        options: [
          'Jane', 'John'
        ]
      }
    ];

    const votes =
    [
      {
      id: 1,
      pollID: 1234,
      voter: 1,
      description: '',
      option: 'Tom',
      delegate: null,
      timestamp: 1500000
    },
    {
      id: 2,
      pollID: 1234,
      voter: 2,
      option: null,
      delegate: 1,
      timestamp: null,
    },
    {
      id: 3,
      pollID: 1235,
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


    //polls[0].owner = users[0];

    return {polls, votes, users};

  }
}