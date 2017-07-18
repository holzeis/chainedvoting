import { InMemoryDbService } from 'angular-in-memory-web-api';
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const polls = [
      {
        id: '1234',
        name: 'Class president',
        description: 'Class president poll of 2017',
        owner: '1',
        validFrom: 'tba',
        validTo: '',
        options: [
          'Tom', 'Jerry'
        ],
        votes: []
      },
      {
        id: '1235',
        name: 'Class vice president',
        description: 'Class vice president poll of 2017',
        owner: null,
        validFrom: 'tba',
        validTo: '',
        options: [
          'Jane', 'John'
        ],
        votes: []
      }
    ];

    const votes =
    [
      {
      id: '1',
      voter: 2,
      description: '',
      option: 'Tom',
      delegate: null,
      timestamp: 1500000
      }
    ];

    const users = [
      {
        id: '1',
        email: 'ysadek@ibm.com',
        polls: ['1234', '1235']
      },
      {
        id: '2',
        email: 'max@mustermann.de',
        polls: null
      }
    ];


    //polls[0].owner = users[0];

    return {polls, votes, users};

  }
}